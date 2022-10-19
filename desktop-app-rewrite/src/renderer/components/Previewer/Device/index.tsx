import { Device as IDevice } from 'common/deviceList';
import {
  InspectElementArgs,
  OpenDevtoolsArgs,
  OpenDevtoolsResult,
  ToggleInspectorArgs,
  ToggleInspectorResult,
} from 'main/devtools';
import { handleContextMenuEvent } from 'main/webview-context-menu/handler';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from 'renderer/components/Spinner';
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
import { NAVIGATION_EVENTS } from '../../AddressBar/NavigationControls';
import Toolbar from './Toolbar';

interface Props {
  device: IDevice;
  isPrimary: boolean;
}

const Device = ({ isPrimary, device }: Props) => {
  const rotateDevice = useSelector(selectRotate);
  let { height, width } = device;
  if (rotateDevice) {
    const temp = width;
    width = height;
    height = temp;
  }
  const address = useSelector(selectAddress);
  const [loading, setLoading] = useState<boolean>(false);
  const [screenshotInProgress, setScreenshotInProgess] =
    useState<boolean>(false);
  const dispatch = useDispatch();
  const zoomfactor = useSelector(selectZoomFactor);
  const isInspecting = useSelector(selectIsInspecting);
  const isDevtoolsOpen = useSelector(selectIsDevtoolsOpen);
  const devtoolsOpenForWebviewId = useSelector(selectDevtoolsWebviewId);

  const dockPosition = useSelector(selectDockPosition);
  const ref = useRef<Electron.WebviewTag>(null);

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

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const webview = ref.current as Electron.WebviewTag;
    webview.addEventListener('did-navigate', (e) => {
      dispatch(setAddress(e.url));
    });

    webview.addEventListener('ipc-message', (e) => {
      if (e.channel === 'context-menu-command') {
        const { command, arg } = e.args[0];
        handleContextMenuEvent(webview, command, arg);
      }
    });

    webview.addEventListener('did-start-loading', () => {
      setLoading(true);
    });
    webview.addEventListener('did-stop-loading', () => {
      setLoading(false);
    });

    webview.addEventListener('crashed', () => {
      // eslint-disable-next-line no-console
      console.error('Web view crashed');
    });

    registerNavigationHandlers();
  }, [ref, dispatch, registerNavigationHandlers]);

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
      const { x: webViewX, y: webViewY } = webview.getBoundingClientRect();
      const {
        coords: { x: deviceX, y: deviceY },
      } = args;
      if (devtoolsOpenForWebviewId !== webview.getWebContentsId()) {
        if (isDevtoolsOpen) {
          dispatch(setDevtoolsClose());
          await window.electron.ipcRenderer.invoke('close-devtools');
        }
        await openDevTools();
      }
      webview.inspectElement(
        Math.round(webViewX + deviceX * zoomfactor),
        Math.round(webViewY + deviceY * zoomfactor)
      );
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
    <div
      className="h-fit flex-shrink-0 overflow-hidden"
      style={{ height: scaledHeight, width: scaledWidth }}
    >
      <div className="flex justify-between">
        <span>
          {device.name}
          <span className="text-xs opacity-60">
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
        />
        {screenshotInProgress ? (
          <div
            className="absolute top-0 left-0 flex h-full w-full items-center justify-center bg-slate-600 bg-opacity-95"
            style={{ height: scaledHeight, width: scaledWidth }}
          >
            <Spinner spinnerHeight={30} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Device;
