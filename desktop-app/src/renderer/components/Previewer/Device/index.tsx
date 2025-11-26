import { Device as IDevice } from 'common/deviceList';
import cx from 'classnames';
import {
  InspectElementArgs,
  OpenDevtoolsArgs,
  OpenDevtoolsResult,
  ToggleInspectorArgs,
  ToggleInspectorResult,
} from 'main/devtools';
import { ReloadArgs } from 'main/menu';
import {
  DisableDefaultWindowOpenHandlerArgs,
  DisableDefaultWindowOpenHandlerResult,
} from 'main/native-functions';
import { CONTEXT_MENUS } from 'main/webview-context-menu/common';
import {
  DeleteStorageArgs,
  DeleteStorageResult,
} from 'main/webview-storage-manager';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from 'renderer/components/Spinner';
import { ADDRESS_BAR_EVENTS } from 'renderer/components/ToolBar/AddressBar';
import { webViewPubSub } from 'renderer/lib/pubsub';
import {
  selectDevtoolsWebviewId,
  selectDockPosition,
  selectIsDevtoolsOpen,
  setDevtoolsClose,
  setDevtoolsOpen,
} from 'renderer/store/features/devtools';
import {
  selectAddress,
  selectIsInspecting,
  selectLayout,
  selectNetworkProfile,
  selectRotate,
  selectZoomFactor,
  setAddress,
  setIsInspecting,
  setLayout,
  setPageTitle,
} from 'renderer/store/features/renderer';
import { IPC_MAIN_CHANNELS, PREVIEW_LAYOUTS } from 'common/constants';
import { NAVIGATION_EVENTS } from '../../ToolBar/NavigationControls';
import Toolbar from './Toolbar';
import { appendHistory } from './utils';
import {
  Coordinates,
  RulersState,
  selectRuler,
  selectRulerEnabled,
  setRuler,
} from '../../../store/features/ruler';
import GuideGrid, { DefaultGuide } from '../Guides';
import ElementMeasurement from '../ElementMeasurement';
import { selectDarkMode } from '../../../store/features/ui';
import useKeyboardShortcut, {
  SHORTCUT_CHANNEL,
} from '../../KeyboardShortcutsManager/useKeyboardShortcut';

interface Props {
  device: IDevice;
  isPrimary: boolean;
  setIndividualDevice: (device: IDevice) => void;
}

interface ErrorState {
  code: number;
  description: string;
}

const Device = ({ isPrimary, device, setIndividualDevice }: Props) => {
  const [singleRotated, setSingleRotated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [screenshotInProgress, setScreenshotInProgress] =
    useState<boolean>(false);
  const address = useSelector(selectAddress);
  const zoomfactor = useSelector(selectZoomFactor);
  const isInspecting = useSelector(selectIsInspecting);
  const rotateDevices = useSelector(selectRotate);
  const isDevtoolsOpen = useSelector(selectIsDevtoolsOpen);
  const devtoolsOpenForWebviewId = useSelector(selectDevtoolsWebviewId);
  const layout = useSelector(selectLayout);
  const rulerEnabled = useSelector(selectRulerEnabled);
  const getRuler = useSelector(selectRuler);
  const networkProfile = useSelector(selectNetworkProfile);
  const dispatch = useDispatch();
  const dockPosition = useSelector(selectDockPosition);
  const darkMode = useSelector(selectDarkMode);
  const ref = useRef<Electron.WebviewTag>(null);
  const isNavigatingFromAddressBar = useRef<boolean>(false);

  useEffect(() => {
    if (ref.current && isPrimary) {
      const webview = ref.current as Electron.WebviewTag;

      // Check if webview is ready before calling getURL
      const checkAndLoadURL = () => {
        try {
          const currentUrl = webview.getURL();
          if (address !== currentUrl) {
            isNavigatingFromAddressBar.current = true;
            webview.loadURL(address);
          }
        } catch (err) {
          // WebView not ready yet, wait for dom-ready event
          const domReadyHandler = () => {
            try {
              const currentUrl = webview.getURL();
              if (address !== currentUrl) {
                isNavigatingFromAddressBar.current = true;
                webview.loadURL(address);
              }
            } catch (loadErr) {
              // eslint-disable-next-line no-console
              console.error('Error loading URL', loadErr);
            }
            webview.removeEventListener('dom-ready', domReadyHandler);
          };
          webview.addEventListener('dom-ready', domReadyHandler);
        }
      };

      checkAndLoadURL();
    }
  }, [address, isPrimary]);

  const isIndividualLayout = layout === PREVIEW_LAYOUTS.INDIVIDUAL;

  let { height, width } = device;

  // Check if device rotation is enabled (only mobile-capable devices can be rotated)
  const isDeviceRotationEnabled =
    device.isMobileCapable && (rotateDevices || singleRotated);

  // Apply rotation: both global and individual rotation only affect mobile-capable devices
  if (isDeviceRotationEnabled) {
    const temp = width;
    width = height;
    height = temp;
  }

  const [coordinates, setCoordinates] = useState<Coordinates>({
    deltaX: 0,
    deltaY: 0,
    innerWidth: width * 2,
    innerHeight: height * 2,
  });

  const registerNavigationHandlers = useCallback(() => {
    webViewPubSub.subscribe(NAVIGATION_EVENTS.RELOAD, () => {
      if (ref.current) {
        const webview = ref.current as Electron.WebviewTag;
        // Clear any existing error state and set loading
        setError(null);
        setLoading(true);

        // If offline mode, reload ignoring cache to show offline state
        if (networkProfile === 'offline') {
          // Set a timeout to show offline error if did-fail-load doesn't fire
          const offlineTimeout = setTimeout(() => {
            setError({
              code: -106, // ERR_INTERNET_DISCONNECTED
              description:
                'You are currently offline. Please check your network connection.',
            });
            setLoading(false);
          }, 2000);

          // Force reload ignoring cache
          webview.reloadIgnoringCache();

          // Clear timeout if did-fail-load fires (handled in didFailLoadHandler)
          // Store timeout ID to clear it when error occurs
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-underscore-dangle
          (webview as any).offlineTimeoutId = offlineTimeout;
        } else {
          webview.reload();
        }
      }
    });
    if (isPrimary) {
      webViewPubSub.subscribe(NAVIGATION_EVENTS.BACK, () => {
        if (ref.current) {
          ref.current.goBack();
        }
      });

      webViewPubSub.subscribe(NAVIGATION_EVENTS.FORWARD, () => {
        if (ref.current) {
          ref.current.goForward();
        }
      });

      webViewPubSub.subscribe(ADDRESS_BAR_EVENTS.DELETE_STORAGE, async () => {
        if (!ref.current) {
          return;
        }
        const webview = ref.current as Electron.WebviewTag;
        await window.electron.ipcRenderer.invoke<
          DeleteStorageArgs,
          DeleteStorageResult
        >('delete-storage', { webContentsId: webview.getWebContentsId() });
      });

      webViewPubSub.subscribe(ADDRESS_BAR_EVENTS.DELETE_COOKIES, async () => {
        if (!ref.current) {
          return;
        }
        const webview = ref.current as Electron.WebviewTag;
        await window.electron.ipcRenderer.invoke<
          DeleteStorageArgs,
          DeleteStorageResult
        >('delete-storage', {
          webContentsId: webview.getWebContentsId(),
          storages: ['cookies'],
        });
      });

      webViewPubSub.subscribe(ADDRESS_BAR_EVENTS.DELETE_CACHE, async () => {
        if (!ref.current) {
          return;
        }
        const webview = ref.current as Electron.WebviewTag;
        await window.electron.ipcRenderer.invoke<
          DeleteStorageArgs,
          DeleteStorageResult
        >('delete-storage', {
          webContentsId: webview.getWebContentsId(),
          storages: ['network-cache'],
        });
      });
    }
  }, [isPrimary, networkProfile]);

  const toggleRuler = useCallback(() => {
    if (!ref.current) {
      return;
    }
    const webview = ref.current as Electron.WebviewTag;
    if (webview == null) {
      return;
    }
    const resolution = `${width}x${height}`;
    const ruler: RulersState | undefined = getRuler(resolution);
    if (ruler) {
      dispatch(
        setRuler({
          resolution,
          rulerState: {
            isRulerEnabled: !ruler.isRulerEnabled,
            rulerCoordinates: ruler.rulerCoordinates,
          },
        })
      );
    } else {
      dispatch(
        setRuler({
          resolution,
          rulerState: {
            isRulerEnabled: true,
            rulerCoordinates: coordinates,
          },
        })
      );
    }
  }, [dispatch, getRuler, height, width, coordinates]);

  useKeyboardShortcut(SHORTCUT_CHANNEL.TOGGLE_RULERS, toggleRuler);

  const openDevTools = useCallback(async () => {
    if (!ref.current) {
      return;
    }
    const webview = ref.current as Electron.WebviewTag;

    if (webview == null) {
      return;
    }
    await window.electron.ipcRenderer.invoke<
      OpenDevtoolsArgs,
      OpenDevtoolsResult
    >('open-devtools', {
      webviewId: webview.getWebContentsId(),
      dockPosition,
    });
    dispatch(setDevtoolsOpen(webview.getWebContentsId()));
  }, [dispatch, dockPosition]);

  const inspectElement = useCallback(
    async (deviceX: number, deviceY: number) => {
      if (!ref.current) {
        return;
      }
      const webview = ref.current as Electron.WebviewTag;
      if (webview == null) {
        return;
      }

      if (devtoolsOpenForWebviewId !== webview.getWebContentsId()) {
        if (isDevtoolsOpen) {
          dispatch(setDevtoolsClose());
          await window.electron.ipcRenderer.invoke('close-devtools');
        }
        await openDevTools();
      }
      const { x: webViewX, y: webViewY } = webview.getBoundingClientRect();
      webview.inspectElement(
        Math.round(webViewX + deviceX * zoomfactor),
        Math.round(webViewY + deviceY * zoomfactor)
      );
    },
    [
      dispatch,
      devtoolsOpenForWebviewId,
      isDevtoolsOpen,
      openDevTools,
      zoomfactor,
    ]
  );

  const onRotateHandler = (state: boolean) => setSingleRotated(state);

  const onIndividualLayoutHandler = (selectedDevice: IDevice) => {
    if (!isIndividualLayout) {
      dispatch(setLayout(PREVIEW_LAYOUTS.INDIVIDUAL));
      setIndividualDevice(selectedDevice);
    } else {
      dispatch(setLayout(PREVIEW_LAYOUTS.COLUMN));
    }
  };

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const webview = ref.current as Electron.WebviewTag;
    const handlerRemovers: (() => void)[] = [];

    const didNavigateHandler = (e: Electron.DidNavigateEvent) => {
      // Only update Redux on the primary device and only if this navigation wasn't initiated by AddressBar
      if (isPrimary && !isNavigatingFromAddressBar.current) {
        dispatch(setAddress(e.url));
      } else if (isPrimary) {
        isNavigatingFromAddressBar.current = false; // Reset the flag
      }

      if (isPrimary) {
        appendHistory(webview.getURL(), webview.getTitle());
      }
    };
    webview.addEventListener('did-navigate', didNavigateHandler);
    webview.addEventListener('did-navigate-in-page', didNavigateHandler);
    handlerRemovers.push(() => {
      webview.removeEventListener('did-navigate', didNavigateHandler);
      webview.removeEventListener('did-navigate-in-page', didNavigateHandler);
    });

    const ipcMessageHandler = (e: Electron.IpcMessageEvent) => {
      if (e.channel === 'pass-scroll-data') {
        setCoordinates({
          deltaX: e.args[0].coordinates.x,
          deltaY: e.args[0].coordinates.y,
          innerHeight: e.args[0].innerHeight,
          innerWidth: e.args[0].innerWidth,
        });
      }
      if (e.channel === 'context-menu-command') {
        const { command, arg } = e.args[0];
        switch (command) {
          case CONTEXT_MENUS.OPEN_CONSOLE.id:
            openDevTools();
            break;
          case CONTEXT_MENUS.INSPECT_ELEMENT.id: {
            const {
              contextMenuMeta: { x, y },
            } = arg;
            inspectElement(x, y);
            break;
          }
          default:
            // eslint-disable-next-line no-console
            console.log('Unhandled context menu command', command);
        }
      }
    };
    webview.addEventListener('ipc-message', ipcMessageHandler);
    handlerRemovers.push(() => {
      webview.removeEventListener('ipc-message', ipcMessageHandler);
    });

    const didStartLoadingHandler = () => {
      setLoading(true);
      setError(null);
    };
    webview.addEventListener('did-start-loading', didStartLoadingHandler);
    handlerRemovers.push(() => {
      webview.removeEventListener('did-start-loading', didStartLoadingHandler);
    });

    const didStopLoadingHandler = () => {
      setLoading(false);
    };

    webview.addEventListener('did-stop-loading', didStopLoadingHandler);
    handlerRemovers.push(() => {
      webview.removeEventListener('did-stop-loading', didStopLoadingHandler);
    });

    const didFailLoadHandler = ({
      errorCode,
      errorDescription,
      isMainFrame,
    }: Electron.DidFailLoadEvent) => {
      if (errorCode === -3 && networkProfile !== 'offline') {
        // Aborted error outside of offline mode can be ignored
        return;
      }

      // Only show error overlay for main frame errors
      // Iframe errors (like CSP violations) should only go to console
      if (!isMainFrame) {
        // eslint-disable-next-line no-console
        console.warn('iframe error:', errorCode, errorDescription);
        return;
      }

      // Clear any pending offline timeout
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-underscore-dangle
      const webviewAny = webview as any;
      if (webviewAny.offlineTimeoutId) {
        clearTimeout(webviewAny.offlineTimeoutId);
        delete webviewAny.offlineTimeoutId;
      }

      const offlineErrorDescription =
        'You are currently offline. Please check your network connection.';

      // In offline mode we let the webview fall back to its own skeleton/placeholder UI
      // instead of showing our overlay. Some requests surface ERR_ABORTED (-3) when
      // cancelled by webRequest, so treat that as an offline scenario too.
      if (
        networkProfile === 'offline' &&
        (errorCode === -106 ||
          errorCode === -105 ||
          errorCode === -118 ||
          errorCode === -3)
      ) {
        setLoading(false);
        setError(null);
        return;
      }

      setError({
        code: errorCode,
        description: errorDescription || offlineErrorDescription,
      });
      setLoading(false);
    };
    webview.addEventListener('did-fail-load', didFailLoadHandler);
    handlerRemovers.push(() => {
      webview.removeEventListener('did-fail-load', didFailLoadHandler);
    });

    // Apply network profile when webview is ready
    const applyNetworkProfile = async () => {
      try {
        const webContentsId = webview.getWebContentsId();
        await window.electron.ipcRenderer.invoke<
          { webContentsId: number; profile: typeof networkProfile },
          { success: boolean }
        >(IPC_MAIN_CHANNELS.SET_NETWORK_PROFILE, {
          webContentsId,
          profile: networkProfile,
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to apply network profile:', err);
      }
    };

    const domReadyHandler = () => {
      applyNetworkProfile();
      if (!isPrimary) {
        window.electron.ipcRenderer.invoke<
          DisableDefaultWindowOpenHandlerArgs,
          DisableDefaultWindowOpenHandlerResult
        >('disable-default-window-open-handler', {
          webContentsId: webview.getWebContentsId(),
        });
      }
    };

    webview.addEventListener('dom-ready', domReadyHandler);
    handlerRemovers.push(() => {
      webview.removeEventListener('dom-ready', domReadyHandler);
    });

    // Apply network profile immediately if webview is already ready
    if (webview.getWebContentsId) {
      try {
        const webContentsId = webview.getWebContentsId();
        if (webContentsId) {
          applyNetworkProfile();
        }
      } catch {
        // Webview not ready yet, will be applied on dom-ready
      }
    }

    registerNavigationHandlers();

    // eslint-disable-next-line consistent-return
    return () => {
      handlerRemovers.forEach((handlerRemover) => {
        handlerRemover();
      });
    };
  }, [
    ref,
    dispatch,
    registerNavigationHandlers,
    isPrimary,
    inspectElement,
    openDevTools,
    address,
    networkProfile,
  ]);

  useEffect(() => {
    // Reload keyboard shortcuts effect
    if (!ref.current) {
      return undefined;
    }
    const webview = ref.current as Electron.WebviewTag;

    const reloadHandler = (args: ReloadArgs) => {
      const { ignoreCache } = args;
      if (ignoreCache === true) {
        webview.reloadIgnoringCache();
      } else {
        webview.reload();
      }
    };

    window.electron.ipcRenderer.on<ReloadArgs>('reload', reloadHandler);

    return () => {
      window.electron.ipcRenderer.removeListener('reload', reloadHandler);
    };
  }, [ref]);

  useEffect(() => {
    if (!ref.current) {
      return undefined;
    }
    const webview = ref.current as Electron.WebviewTag;
    const inspectElementHandler = async (_args: unknown) => {
      const args: InspectElementArgs = _args as InspectElementArgs;
      if (webview.getWebContentsId() !== args.webviewId) {
        return;
      }
      dispatch(setIsInspecting(false));
      const {
        coords: { x: deviceX, y: deviceY },
      } = args;
      inspectElement(deviceX, deviceY);
    };

    window.electron.ipcRenderer.on('inspect-element', inspectElementHandler);

    return () => {
      try {
        window.electron.ipcRenderer.removeAllListeners('inspect-element');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error while removing ipc listener', e);
      }
    };
  }, [
    ref,
    dispatch,
    isDevtoolsOpen,
    devtoolsOpenForWebviewId,
    openDevTools,
    zoomfactor,
    inspectElement,
  ]);

  useEffect(() => {
    if (!ref.current || isInspecting === undefined) {
      return;
    }
    const webview = ref.current as Electron.WebviewTag;
    (async () => {
      await window.electron.ipcRenderer.invoke<
        ToggleInspectorArgs,
        ToggleInspectorResult
      >(
        isInspecting ? 'enable-inspector-overlay' : 'disable-inspector-overlay',
        {
          webviewId: webview.getWebContentsId(),
        }
      );
    })();
  }, [isInspecting]);

  useEffect(() => {
    if (!ref.current || !device.isMobileCapable) {
      return;
    }

    const webview = ref.current;
    webview.addEventListener('dom-ready', () => {
      webview.insertCSS(`
               ::-webkit-scrollbar {
              display: none;
              } `);
    });

    // eslint-disable-next-line consistent-return
    return () => {
      webview.removeEventListener('dom-ready', () => {});
    };
  }, [device.isMobileCapable]);

  useEffect(() => {
    const webview = ref.current;

    if (isPrimary && webview) {
      webview.addEventListener('dom-ready', () => {
        const pageTitle = webview.getTitle();
        dispatch(setPageTitle(pageTitle));
      });
    }

    // eslint-disable-next-line consistent-return
    return () => {
      webview?.removeEventListener('dom-ready', () => {});
    };
  }, [dispatch, isPrimary]);

  const scaledHeight = height * zoomfactor;
  const scaledWidth = width * zoomfactor;

  const isRestrictedMinimumDeviceSize =
    device.width < 400 && zoomfactor < 0.6 && !isDeviceRotationEnabled;

  return (
    <div
      className={cx('h-fit', {
        'w-52': isRestrictedMinimumDeviceSize,
      })}
    >
      <div className="flex justify-between">
        <span>
          {device.name}
          <span className="ml-[2px] text-xs opacity-60">
            {width}x{height}
          </span>
        </span>
        {loading ? <Spinner spinnerHeight={24} /> : null}
      </div>
      <Toolbar
        webview={ref.current}
        device={device}
        setScreenshotInProgress={setScreenshotInProgress}
        openDevTools={openDevTools}
        toggleRuler={toggleRuler}
        onRotate={onRotateHandler}
        onIndividualLayoutHandler={onIndividualLayoutHandler}
        isIndividualLayout={isIndividualLayout}
        isDeviceRotationEnabled={isDeviceRotationEnabled}
      />
      <div
        style={{
          height: rulerEnabled(`${width}x${height}`)
            ? scaledHeight + 30
            : scaledHeight,
          width: rulerEnabled(`${width}x${height}`)
            ? scaledWidth + 30
            : scaledWidth,
        }}
        className="relative origin-top-left overflow-hidden bg-white"
      >
        <GuideGrid
          scaledHeight={scaledHeight}
          scaledWidth={scaledWidth}
          height={height}
          width={width}
          coordinates={coordinates}
          zoomFactor={zoomfactor}
          night={darkMode}
          enabled={rulerEnabled(`${width}x${height}`)}
          defaultGuides={window.electron.store
            .get('userPreferences.guides')
            .flatMap((x: unknown) => x as DefaultGuide[])
            .filter((x: DefaultGuide) => {
              return x.resolution === `${width}x${height}`;
            })}
        />
        <div className="relative bg-white">
          <webview
            id={device.name}
            src={address}
            style={{
              height,
              width,
              display: 'inline-flex',
              transform: `scale(${zoomfactor})`,
              marginLeft: rulerEnabled(`${width}x${height}`) ? '30px' : 0,
              marginTop: rulerEnabled(`${width}x${height}`) ? '30px' : 0,
            }}
            ref={ref}
            className="origin-top-left"
            /* eslint-disable-next-line react/no-unknown-property */
            preload={`file://${window.responsively.webviewPreloadPath}`}
            data-scale-factor={zoomfactor}
            /* eslint-disable-next-line react/no-unknown-property */
            allowpopups={isPrimary ? 'true' : undefined}
            /* eslint-disable-next-line react/no-unknown-property */
            useragent={device.userAgent}
          />
          <ElementMeasurement
            deviceId={device.name}
            width={width}
            height={height}
            zoomFactor={zoomfactor}
          />
        </div>

        {screenshotInProgress ? (
          <div
            className="absolute top-0 left-0 flex h-full w-full items-center justify-center bg-slate-600 bg-opacity-95"
            style={{ height: scaledHeight, width: scaledWidth }}
          >
            <Spinner spinnerHeight={30} />
          </div>
        ) : null}
        {error != null ? (
          <div
            className="absolute top-0 left-0 flex h-full w-full items-center justify-center bg-slate-600 bg-opacity-95"
            style={{ height: scaledHeight, width: scaledWidth }}
          >
            <div className="text-center text-sm text-white">
              <div className="text-base font-bold">ERROR: {error.code}</div>
              <div className="text-sm">{error.description}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Device;
