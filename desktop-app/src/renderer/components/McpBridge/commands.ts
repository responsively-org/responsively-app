import {Device, getDevicesMap} from 'common/deviceList';
import {
  McpActiveDevice,
  McpAppState,
  McpBridgeCommand,
  McpCaptureTargetsPayload,
  McpCaptureTargetsResult,
  McpDeviceInfo,
  McpNavigatePayload,
  McpNavigateResult,
  McpSetActiveDevicesPayload,
  McpSetActiveDevicesResult,
  McpSetDeviceOptionsPayload,
  McpSetDeviceOptionsResult,
  McpSetMirroringPayload,
  McpSetMirroringResult,
} from 'common/mcp';
import {Store} from 'redux';
import {
  getEffectiveDeviceViewport,
  selectActiveSuite,
  setSuiteDevices,
  setViewportOptions,
} from 'renderer/store/features/device-manager';
import {
  selectEventMirroringEnabled,
  setEventMirroring,
} from 'renderer/store/features/event-mirroring';
import {applyEventMirroring} from 'renderer/lib/event-mirroring';
import {applyDeviceColorScheme} from 'renderer/lib/device-color-scheme';
import {selectZoomFactor, setAddress} from 'renderer/store/features/renderer';
import type {RootState} from '../../store';
import {resolveDeviceQuery} from './deviceQuery';

type AppStore = Pick<Store<RootState>, 'getState' | 'dispatch'>;

const NAVIGATION_TIMEOUT_MS = 30_000;

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const toDeviceInfo = (device: Device) => ({
  id: device.id,
  name: device.name,
  width: device.width,
  height: device.height,
  type: device.type,
});

const toActiveDevice = (device: Device, state: RootState): McpActiveDevice => {
  const options = state.deviceManager.viewportOverrides[device.id];
  const viewport = getEffectiveDeviceViewport(
    device,
    state.renderer.rotate,
    state.deviceManager.individualRotations[device.id],
    options
  );
  return {
    ...toDeviceInfo(device),
    width: viewport.width,
    height: viewport.height,
    orientation: viewport.orientation,
    colorScheme: options?.colorScheme ?? 'system',
    mirroringEnabled: selectEventMirroringEnabled(state, device.id),
  };
};

const getActiveDevices = (state: RootState): Device[] => {
  const devicesMap = getDevicesMap();
  return selectActiveSuite(state)
    .devices.map((id) => devicesMap[id])
    .filter((device): device is Device => device !== undefined);
};

const getDeviceWebview = (deviceName: string): Electron.WebviewTag | null => {
  // Device names contain spaces and slashes, so getElementById instead of selectors.
  return document.getElementById(deviceName) as Electron.WebviewTag | null;
};

const getAppState = (state: RootState): McpAppState => ({
  url: state.renderer.address,
  pageTitle: state.renderer.pageTitle,
  layout: state.renderer.layout,
  zoomFactor: selectZoomFactor(state),
  activeSuite: selectActiveSuite(state).name,
  activeDevices: getActiveDevices(state).map((device) => toActiveDevice(device, state)),
});

const listDevices = (state: RootState): McpDeviceInfo[] => {
  const activeIds = new Set(selectActiveSuite(state).devices);
  return Object.values(getDevicesMap()).map((device) => ({
    ...toDeviceInfo(device),
    isCustom: device.isCustom ?? false,
    isActive: activeIds.has(device.id),
  }));
};

const setActiveDevices = async (
  store: AppStore,
  payload: McpSetActiveDevicesPayload
): Promise<McpSetActiveDevicesResult> => {
  const queries = payload?.devices ?? [];
  if (queries.length === 0) {
    throw new Error('Provide at least one device id or name');
  }
  const devicesMap = getDevicesMap();
  const resolved: Device[] = [];
  const unmatched: string[] = [];
  queries.forEach((query) => {
    const device = resolveDeviceQuery(devicesMap, query);
    if (device === undefined) {
      unmatched.push(query);
    } else if (!resolved.some((d) => d.id === device.id)) {
      resolved.push(device);
    }
  });
  if (unmatched.length > 0) {
    throw new Error(
      `Unknown devices: ${unmatched.join(
        ', '
      )}. Use the list_devices tool to see valid ids and names.`
    );
  }
  const activeSuite = selectActiveSuite(store.getState());
  store.dispatch(
    setSuiteDevices({suite: activeSuite.id, devices: resolved.map((device) => device.id)})
  );
  // Give the new webviews a moment to mount before subsequent tool calls.
  await sleep(300);
  return {activeDevices: resolved.map((device) => toActiveDevice(device, store.getState()))};
};

const resolveActiveDevice = (state: RootState, query?: string): Device => {
  const active = getActiveDevices(state);
  if (query === undefined) {
    if (active[0] === undefined) {
      throw new Error('No active devices. Use the set_active_devices tool first.');
    }
    return active[0];
  }
  const device = resolveDeviceQuery(getDevicesMap(), query);
  if (device === undefined) {
    throw new Error(
      `Unknown device: ${query}. Use the list_devices tool to see valid ids and names.`
    );
  }
  if (!active.some((item) => item.id === device.id)) {
    throw new Error(
      `Device "${device.name}" is not active. Use the set_active_devices tool first.`
    );
  }
  return device;
};

const requireWebview = (device: Device): Electron.WebviewTag => {
  const webview = getDeviceWebview(device.name);
  if (webview === null) {
    throw new Error(
      `The ${device.name} preview is not mounted. Switch the app to the browser view and retry.`
    );
  }
  return webview;
};

const readViewport = async (webview: Electron.WebviewTag, timeoutMs: number) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      webview.executeJavaScript('({width: innerWidth, height: innerHeight})') as Promise<{
        width: number;
        height: number;
      }>,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(
                'Viewport settings were saved, but the preview did not respond in time. Retry after it finishes loading.'
              )
            ),
          Math.max(1, timeoutMs)
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

const setMirroring = async (
  store: AppStore,
  payload: McpSetMirroringPayload
): Promise<McpSetMirroringResult> => {
  if (typeof payload?.enabled !== 'boolean') {
    throw new Error('enabled must be a boolean.');
  }
  const state = store.getState();
  const devices =
    payload.device === undefined
      ? getActiveDevices(state)
      : [resolveActiveDevice(state, payload.device)];
  if (devices.length === 0) {
    throw new Error('No active devices. Use the set_active_devices tool first.');
  }
  const previews = devices.map((device) => ({device, webview: requireWebview(device)}));
  store.dispatch(
    setEventMirroring({deviceIds: devices.map((device) => device.id), enabled: payload.enabled})
  );
  const results = await Promise.allSettled(
    previews.map(({webview}) => applyEventMirroring(webview, payload.enabled))
  );
  const failures = results.flatMap((result, index) =>
    result.status === 'rejected'
      ? [
          `${devices[index].name}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`,
        ]
      : []
  );
  if (failures.length > 0) {
    throw new Error(
      `Mirroring settings were saved, but could not be applied to ${failures.join('; ')}. Retry set_mirroring after the previews load.`
    );
  }
  return {activeDevices: getAppState(store.getState()).activeDevices};
};

const setDeviceOptions = async (
  store: AppStore,
  payload: McpSetDeviceOptionsPayload
): Promise<McpSetDeviceOptionsResult> => {
  const {width, height, orientation, colorScheme, reset} = payload ?? {};
  if (
    width === undefined &&
    height === undefined &&
    orientation === undefined &&
    colorScheme === undefined &&
    reset !== true
  ) {
    throw new Error('Provide width, height, orientation, colorScheme, or reset: true.');
  }
  for (const [name, value] of Object.entries({width, height})) {
    if (value !== undefined && (!Number.isInteger(value) || value < 1 || value > 10000)) {
      throw new Error(`${name} must be an integer between 1 and 10000 CSS pixels.`);
    }
  }
  if (orientation !== undefined && !['portrait', 'landscape'].includes(orientation)) {
    throw new Error('orientation must be portrait or landscape.');
  }
  if (colorScheme !== undefined && !['light', 'dark', 'system'].includes(colorScheme)) {
    throw new Error('colorScheme must be light, dark, or system.');
  }
  if (reset !== undefined && typeof reset !== 'boolean') {
    throw new Error('reset must be a boolean.');
  }
  const device = resolveActiveDevice(store.getState(), payload.device);
  const webview = requireWebview(device);
  const current = reset
    ? getEffectiveDeviceViewport(device, store.getState().renderer.rotate)
    : toActiveDevice(device, store.getState());
  const geometry =
    width !== undefined || height !== undefined || orientation !== undefined
      ? {width: width ?? current.width, height: height ?? current.height, orientation}
      : {};
  store.dispatch(setViewportOptions({id: device.id, ...geometry, colorScheme, reset}));
  const effective = toActiveDevice(device, store.getState());
  await applyDeviceColorScheme(webview, effective.colorScheme);
  // React applies the frame dimensions asynchronously. Wait for the guest to
  // acknowledge its real viewport before returning to the next agent action.
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (
      webview.offsetWidth === 0 &&
      webview.offsetHeight === 0 &&
      parseFloat(webview.style.width) === effective.width &&
      parseFloat(webview.style.height) === effective.height
    ) {
      return {device: toActiveDevice(device, store.getState()), viewportApplied: false};
    }
    if (webview.offsetWidth === effective.width && webview.offsetHeight === effective.height) {
      const viewport = await readViewport(webview, deadline - Date.now());
      if (
        Math.abs(viewport.width - effective.width) <= 1 &&
        Math.abs(viewport.height - effective.height) <= 1
      ) {
        return {device: toActiveDevice(device, store.getState()), viewportApplied: true};
      }
    }
    await sleep(50);
  }
  throw new Error(
    `The ${device.name} viewport settings were saved, but the preview did not resize in time. Retry after it finishes loading.`
  );
};

const navigate = async (
  store: AppStore,
  payload: McpNavigatePayload
): Promise<McpNavigateResult> => {
  const requestedUrl = payload?.url;
  if (!requestedUrl) {
    throw new Error('URL is required');
  }
  const url = new URL(requestedUrl).href;
  const isRequestedUrl = (candidate: string) => {
    try {
      return new URL(candidate).href === url;
    } catch {
      return false;
    }
  };
  const state = store.getState();
  const primaryDevice = getActiveDevices(state)[0];
  if (primaryDevice === undefined) {
    throw new Error('No active devices to navigate. Use the set_active_devices tool first.');
  }
  const webview = getDeviceWebview(primaryDevice.name);
  if (webview === null) {
    throw new Error('The device previews are not visible. Switch the app to the browser view.');
  }

  const previews = getActiveDevices(state).map(requireWebview);
  const completions = previews.map((preview) => {
    let started = false;
    try {
      if (isRequestedUrl(preview.getURL())) {
        if (!preview.isLoading()) return Promise.resolve(true);
        started = true;
      }
    } catch {
      // A new guest may not have attached yet; await its navigation events.
    }
    return new Promise<boolean>((resolve) => {
      let settled = false;
      const finish = (result: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        preview.removeEventListener('did-start-navigation', onStartNavigation);
        preview.removeEventListener('did-stop-loading', onStopLoading);
        preview.removeEventListener('did-fail-load', onFailLoad);
        resolve(result);
      };
      const onStartNavigation = (event: Electron.DidStartNavigationEvent) => {
        if (event.isMainFrame && isRequestedUrl(event.url)) started = true;
      };
      const onStopLoading = () => {
        if (started) finish(true);
      };
      const onFailLoad = (event: Electron.DidFailLoadEvent) => {
        if (started && event.isMainFrame && event.errorCode !== -3) finish(false);
      };
      const timer = setTimeout(() => finish(false), NAVIGATION_TIMEOUT_MS);
      preview.addEventListener('did-start-navigation', onStartNavigation);
      preview.addEventListener('did-stop-loading', onStopLoading);
      preview.addEventListener('did-fail-load', onFailLoad);
    });
  });
  // This is an explicit navigation for every preview, including isolated
  // devices that have diverged while the shared address stayed the same.
  store.dispatch(setAddress(url));
  const loaded = (await Promise.all(completions)).every(Boolean);
  return {url: webview.getURL(), pageTitle: webview.getTitle(), loaded};
};

const getCaptureTargets = (
  state: RootState,
  payload: McpCaptureTargetsPayload
): McpCaptureTargetsResult => {
  let devices = getActiveDevices(state);
  if (payload?.device !== undefined && payload.device !== '') {
    const device = resolveDeviceQuery(getDevicesMap(), payload.device);
    if (device === undefined) {
      throw new Error(
        `Unknown device: ${payload.device}. Use the list_devices tool to see valid ids and names.`
      );
    }
    if (!devices.some((d) => d.id === device.id)) {
      throw new Error(
        `Device "${device.name}" is not in the active preview. Use the set_active_devices tool to activate it first.`
      );
    }
    devices = [device];
  }

  const result: McpCaptureTargetsResult = {targets: [], skipped: []};
  devices.forEach((device) => {
    const effective = toActiveDevice(device, state);
    const webview = getDeviceWebview(device.name);
    if (webview === null) {
      result.skipped.push({
        deviceName: device.name,
        reason: 'preview is not mounted (the Focused layout shows a single device)',
      });
      return;
    }
    if (webview.offsetWidth === 0 && webview.offsetHeight === 0) {
      result.skipped.push({
        deviceName: device.name,
        reason: 'preview is hidden; show it to capture its current viewport settings',
      });
      return;
    }
    try {
      result.targets.push({
        deviceName: device.name,
        width: effective.width,
        height: effective.height,
        webContentsId: webview.getWebContentsId(),
        url: webview.getURL(),
      });
    } catch {
      result.skipped.push({deviceName: device.name, reason: 'preview is still loading'});
    }
  });
  return result;
};

export const executeMcpCommand = async (
  store: AppStore,
  command: McpBridgeCommand,
  payload: unknown
): Promise<unknown> => {
  switch (command) {
    case 'get-app-state':
      return getAppState(store.getState());
    case 'list-devices':
      return listDevices(store.getState());
    case 'set-active-devices':
      return setActiveDevices(store, payload as McpSetActiveDevicesPayload);
    case 'set-mirroring':
      return setMirroring(store, payload as McpSetMirroringPayload);
    case 'set-device-options':
      return setDeviceOptions(store, payload as McpSetDeviceOptionsPayload);
    case 'navigate':
      return navigate(store, payload as McpNavigatePayload);
    case 'get-capture-targets':
      return getCaptureTargets(store.getState(), (payload ?? {}) as McpCaptureTargetsPayload);
    default:
      throw new Error(`Unknown MCP command: ${command}`);
  }
};
