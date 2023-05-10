import { Device as IDevice } from 'common/deviceList';
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
  selectRotate,
  selectZoomFactor,
  setAddress,
  setIsInspecting,
} from 'renderer/store/features/renderer';
import { NAVIGATION_EVENTS } from '../../ToolBar/NavigationControls';
import Toolbar from './Toolbar';
import { appendHistory } from './utils';

interface Props {
  device: IDevice;
  isPrimary: boolean;
}

interface ErrorState {
  code: number;
  description: string;
}

const Device = ({ isPrimary, device }: Props) => {
  const [singleRotated, setSingleRotated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [screenshotInProgress, setScreenshotInProgess] =
    useState<boolean>(false);
  const address = useSelector(selectAddress);
  const zoomfactor = useSelector(selectZoomFactor);
  const isInspecting = useSelector(selectIsInspecting);
  const rotateDevices = useSelector(selectRotate);
  const isDevtoolsOpen = useSelector(selectIsDevtoolsOpen);
  const devtoolsOpenForWebviewId = useSelector(selectDevtoolsWebviewId);
  const dispatch = useDispatch();

  const dockPosition = useSelector(selectDockPosition);
  const ref = useRef<Electron.WebviewTag>(null);

  let { height, width } = device;

  if (rotateDevices || singleRotated) {
    const temp = width;
    width = height;
    height = temp;
  }

  const registerNavigationHandlers = useCallback(() => {
    webViewPubSub.subscribe(NAVIGATION_EVENTS.RELOAD, () => {
      if (ref.current) {
        ref.current.reload();
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
  }, [isPrimary]);

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

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const webview = ref.current as Electron.WebviewTag;
    const handlerRemovers: (() => void)[] = [];

    const didNavigateHandler = (e: Electron.DidNavigateEvent) => {
      dispatch(setAddress(e.url));
      if (isPrimary) {
        appendHistory(webview.getURL(), webview.getTitle());
      }
    };
    webview.addEventListener('did-navigate', didNavigateHandler);
    handlerRemovers.push(() => {
      webview.removeEventListener('did-navigate', didNavigateHandler);
    });

    const ipc̨MessageHandler = (e: Electron.IpcMessageEvent) => {
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
            console.log('Unhandled context menu command', command);
        }
      }
    };
    webview.addEventListener('ipc-message', ipc̨MessageHandler);
    handlerRemovers.push(() => {
      webview.removeEventListener('ipc-message', ipc̨MessageHandler);
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
    }: Electron.DidFailLoadEvent) => {
      if (errorCode === -3) {
        // Aborted error, can be ignored
        return;
      }
      setError({
        code: errorCode,
        description: errorDescription,
      });
    };
    webview.addEventListener('did-fail-load', didFailLoadHandler);
    handlerRemovers.push(() => {
      webview.removeEventListener('did-fail-load', didFailLoadHandler);
    });

    if (!isPrimary) {
      setTimeout(() => {
        window.electron.ipcRenderer.invoke<
          DisableDefaultWindowOpenHandlerArgs,
          DisableDefaultWindowOpenHandlerResult
        >('disable-default-window-open-handler', {
          webContentsId: webview.getWebContentsId(),
        });
      }, 2000);
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

  const scaledHeight = height * zoomfactor;
  const scaledWidth = width * zoomfactor;

  return (
    <div className="h-fit flex-shrink-0 overflow-hidden">
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
        setScreenshotInProgress={setScreenshotInProgess}
        openDevTools={openDevTools}
        onRotate={onRotateHandler}
      />
      <div
        style={{ height: scaledHeight, width: scaledWidth }}
        className="relative origin-top-left bg-white"
      >
        <webview
          id={device.name}
          src={address}
          style={{
            height,
            width,
            display: 'inline-flex',
            transform: `scale(${zoomfactor})`,
          }}
          ref={ref}
          className="origin-top-left"
          /* eslint-disable-next-line react/no-unknown-property */
          preload={`file://${window.responsively.webviewPreloadPath}`}
          data-scale-factor={zoomfactor}
          /* eslint-disable-next-line react/no-unknown-property */
          allowpopups={isPrimary ? ('true' as any) : undefined}
        />
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
