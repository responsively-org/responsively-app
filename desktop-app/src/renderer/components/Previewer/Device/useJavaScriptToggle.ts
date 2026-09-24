import {IPC_MAIN_CHANNELS} from 'common/constants';
import {SetJavascriptEnabledArgs, SetJavascriptEnabledResult} from 'main/javascript-toggle';
import {RefObject, useCallback, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  selectDisabledJavaScript,
  setDeviceJavaScriptDisabled,
} from 'renderer/store/features/device-manager';

interface Params {
  ref: RefObject<Electron.WebviewTag | null>;
  webviewReady: boolean;
  deviceId: string;
}

/**
 * Wires one preview webview's JavaScript-enabled state to the CDP-backed main
 * process handler and remembers it (per device) in the store.
 */
const useJavaScriptToggle = ({ref, webviewReady, deviceId}: Params) => {
  const dispatch = useDispatch();
  const disabledJavaScriptMap = useSelector(selectDisabledJavaScript);
  const jsDisabled = disabledJavaScriptMap[deviceId] ?? false;

  const applyToWebContents = useCallback(async (webviewId: number, enabled: boolean) => {
    await window.electron.ipcRenderer.invoke<SetJavascriptEnabledArgs, SetJavascriptEnabledResult>(
      IPC_MAIN_CHANNELS.SET_JAVASCRIPT_ENABLED,
      {webviewId, enabled}
    );
  }, []);

  const toggleJavaScript = useCallback(() => {
    const webview = ref.current;
    if (webview == null) {
      return;
    }
    const nextDisabled = !jsDisabled;
    dispatch(setDeviceJavaScriptDisabled({id: deviceId, disabled: nextDisabled}));
    applyToWebContents(webview.getWebContentsId(), !nextDisabled);
  }, [ref, jsDisabled, dispatch, deviceId, applyToWebContents]);

  // A freshly attached guest (first load, or a whole new <webview> after this
  // device was unmounted/remounted) always starts with JS enabled — CDP state
  // lives on the webContents, not in our store. Re-apply a stored "disabled"
  // choice once per guest, keyed by webContents id so this doesn't loop with
  // the reload the main handler issues after applying it.
  const appliedForWebContentsId = useRef<number | null>(null);
  useEffect(() => {
    if (!webviewReady || ref.current == null) {
      return;
    }
    const webContentsId = ref.current.getWebContentsId();
    if (appliedForWebContentsId.current === webContentsId) {
      return;
    }
    appliedForWebContentsId.current = webContentsId;
    if (jsDisabled) {
      applyToWebContents(webContentsId, false);
    }
  }, [webviewReady, ref, jsDisabled, applyToWebContents]);

  return {jsDisabled, toggleJavaScript};
};

export default useJavaScriptToggle;
