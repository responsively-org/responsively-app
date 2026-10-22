import {IPC_MAIN_CHANNELS} from 'common/constants';
import {
  InspectElementArgs,
  OpenDevtoolsArgs,
  OpenDevtoolsResult,
  ToggleInspectorArgs,
  ToggleInspectorResult,
} from 'main/devtools';
import {RefObject, useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  selectDevtoolsWebviewId,
  selectDockPosition,
  selectIsDevtoolsOpen,
  setDevtoolsClose,
  setDevtoolsOpen,
} from 'renderer/store/features/devtools';
import {selectIsInspecting, setIsInspecting} from 'renderer/store/features/renderer';

interface Params {
  ref: RefObject<Electron.WebviewTag | null>;
  webviewReady: boolean;
  zoomfactor: number;
}

/**
 * Wires one preview webview to the shared devtools: open/close, the CDP
 * inspect-element round trip, and the point-to-inspect overlay.
 */
const useDevtoolsBridge = ({ref, webviewReady, zoomfactor}: Params) => {
  const dispatch = useDispatch();
  const isInspecting = useSelector(selectIsInspecting);
  const isDevtoolsOpen = useSelector(selectIsDevtoolsOpen);
  const devtoolsOpenForWebviewId = useSelector(selectDevtoolsWebviewId);
  const dockPosition = useSelector(selectDockPosition);

  const openDevTools = useCallback(async () => {
    if (!ref.current) {
      return;
    }
    const webview = ref.current as Electron.WebviewTag;

    if (webview == null) {
      return;
    }
    await window.electron.ipcRenderer.invoke<OpenDevtoolsArgs, OpenDevtoolsResult>(
      IPC_MAIN_CHANNELS.OPEN_DEVTOOLS,
      {
        webviewId: webview.getWebContentsId(),
        dockPosition,
      }
    );
    dispatch(setDevtoolsOpen(webview.getWebContentsId()));
  }, [ref, dispatch, dockPosition]);

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
          await window.electron.ipcRenderer.invoke(IPC_MAIN_CHANNELS.CLOSE_DEVTOOLS);
        }
        await openDevTools();
      }
      const {x: webViewX, y: webViewY} = webview.getBoundingClientRect();
      webview.inspectElement(
        Math.round(webViewX + deviceX * zoomfactor),
        Math.round(webViewY + deviceY * zoomfactor)
      );
    },
    [ref, dispatch, devtoolsOpenForWebviewId, isDevtoolsOpen, openDevTools, zoomfactor]
  );

  // Element picked via the CDP overlay in the main process.
  useEffect(() => {
    if (!ref.current || !webviewReady) {
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
        coords: {x: deviceX, y: deviceY},
      } = args;
      inspectElement(deviceX, deviceY);
    };

    window.electron.ipcRenderer.on(IPC_MAIN_CHANNELS.INSPECT_ELEMENT, inspectElementHandler);

    return () => {
      try {
        window.electron.ipcRenderer.removeAllListeners(IPC_MAIN_CHANNELS.INSPECT_ELEMENT);
      } catch (e) {
        console.error('Error while removing ipc listener', e);
      }
    };
  }, [ref, dispatch, inspectElement, webviewReady]);

  // Point-to-inspect overlay toggle.
  useEffect(() => {
    if (!ref.current || !webviewReady || isInspecting === undefined) {
      return;
    }
    const webview = ref.current as Electron.WebviewTag;
    (async () => {
      await window.electron.ipcRenderer.invoke<ToggleInspectorArgs, ToggleInspectorResult>(
        isInspecting
          ? IPC_MAIN_CHANNELS.ENABLE_INSPECTOR_OVERLAY
          : IPC_MAIN_CHANNELS.DISABLE_INSPECTOR_OVERLAY,
        {
          webviewId: webview.getWebContentsId(),
        }
      );
    })();
  }, [ref, isInspecting, webviewReady]);

  return {openDevTools, inspectElement};
};

export default useDevtoolsBridge;
