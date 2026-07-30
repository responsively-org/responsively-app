import {PREVIEW_LAYOUTS} from 'common/constants';
import {Device, getDevicesMap} from 'common/deviceList';
import {DEFAULT_SUITE, PreviewSuites} from './features/device-manager';
import {sanitizeSuites} from './features/device-manager/utils';
import {zoomSteps} from './features/renderer';

const urlFromQueryParam = (): string | undefined => {
  const params = new URLSearchParams(window.location.search);
  const url = params.get('urlToOpen');
  if (url != null && url !== 'undefined') {
    return url;
  }
  return undefined;
};

const zoomFactorFromStep = (stepIndex: unknown): number => {
  const factor = zoomSteps[stepIndex as number];
  return factor ?? zoomSteps[8];
};

/**
 * All reads from the persisted electron-store happen here, once, at renderer
 * bootstrap — slices stay pure and never touch window.electron. The one write
 * is suite sanitization (dropping deleted custom devices), which persists its
 * cleanup immediately so the store never re-serves stale suites.
 */
export const buildPreloadedState = () => {
  const {store} = window.electron;

  const {suites: sanitized, dirty} = sanitizeSuites(
    store.get('deviceManager.previewSuites') as PreviewSuites | null
  );
  const suites = sanitized ?? [DEFAULT_SUITE];
  if (dirty) {
    store.set('deviceManager.previewSuites', suites);
  }

  const devicesMap = getDevicesMap();
  const activeDeviceIds: string[] = store.get('deviceManager.activeDevices') ?? [];
  const devices = activeDeviceIds
    .map((id) => devicesMap[id])
    .filter((device): device is Device => device != null);

  return {
    ui: {
      darkMode: Boolean(store.get('ui.darkMode')),
      appView: 'BROWSER' as const,
      menuFlyout: false,
    },
    renderer: {
      address: urlFromQueryParam() ?? String(store.get('homepage') ?? ''),
      pageTitle: '',
      individualZoomFactor: zoomFactorFromStep(store.get('renderer.individualZoomStepIndex')),
      zoomFactor: zoomFactorFromStep(store.get('renderer.zoomStepIndex')),
      rotate: false,
      isInspecting: undefined,
      layout: store.get('ui.previewLayout') ?? PREVIEW_LAYOUTS.FLEX,
      isCapturingScreenshot: false,
      notifications: null,
      canvasZoom: 0.9,
    },
    devtools: {
      bounds: {x: 0, y: 0, width: 0, height: 0},
      isOpen: false,
      dockPosition: store.get('devtools.dockPosition') ?? 'BOTTOM',
      webViewId: -1,
    },
    bookmarks: {
      bookmarks: store.get('bookmarks') ?? [],
    },
    designOverlay: store.get('userPreferences.designOverlays') ?? {},
    deviceManager: {
      devices,
      activeSuite: DEFAULT_SUITE.id,
      suites,
      individualRotations: {},
    },
  };
};

export type PreloadedAppState = ReturnType<typeof buildPreloadedState>;
