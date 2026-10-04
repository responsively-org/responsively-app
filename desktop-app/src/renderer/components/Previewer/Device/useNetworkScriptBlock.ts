import {IPC_MAIN_CHANNELS} from 'common/constants';
import {
  SetNetworkScriptsBlockedArgs,
  SetNetworkScriptsBlockedResult,
} from 'main/network-script-blocker';
import {RefObject, useCallback, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  selectNetworkScriptsBlocked,
  setDeviceNetworkScriptsBlocked,
} from 'renderer/store/features/device-manager';

interface Params {
  ref: RefObject<Electron.WebviewTag | null>;
  webviewReady: boolean;
  deviceId: string;
}

/**
 * Wires one preview webview's network-level script blocking to the main
 * process handler and remembers it (per device) in the store. Unlike JS
 * execution (CDP-based, per-navigation), a network block is keyed by
 * webContents id in the main process and applies automatically to every
 * future request from that guest — no per-navigation reapply is needed here,
 * only a one-time reapply when a device gets a fresh webContents (e.g. after
 * being removed and re-added).
 */
const useNetworkScriptBlock = ({ref, webviewReady, deviceId}: Params) => {
  const dispatch = useDispatch();
  const blockedMap = useSelector(selectNetworkScriptsBlocked);
  const blocked = blockedMap[deviceId] ?? false;

  const applyToWebContents = useCallback(async (webviewId: number, shouldBlock: boolean) => {
    await window.electron.ipcRenderer.invoke<
      SetNetworkScriptsBlockedArgs,
      SetNetworkScriptsBlockedResult
    >(IPC_MAIN_CHANNELS.SET_NETWORK_SCRIPTS_BLOCKED, {webviewId, blocked: shouldBlock});
  }, []);

  const toggleNetworkScriptBlock = useCallback(() => {
    const webview = ref.current;
    if (webview == null) {
      return;
    }
    const nextBlocked = !blocked;
    dispatch(setDeviceNetworkScriptsBlocked({id: deviceId, blocked: nextBlocked}));
    applyToWebContents(webview.getWebContentsId(), nextBlocked);
  }, [ref, blocked, dispatch, deviceId, applyToWebContents]);

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
    if (blocked) {
      applyToWebContents(webContentsId, true);
    }
  }, [webviewReady, ref, blocked, applyToWebContents]);

  return {networkScriptsBlocked: blocked, toggleNetworkScriptBlock};
};

export default useNetworkScriptBlock;
