import {ipcMain, session, webContents} from 'electron';
import {IPC_MAIN_CHANNELS} from '../../common/constants';
import {isRegisteredWebview} from '../webview-registry';

export interface SetNetworkScriptsBlockedArgs {
  webviewId: number;
  blocked: boolean;
}

export interface SetNetworkScriptsBlockedResult {
  status: boolean;
}

// Distinct from the CDP-based JS-disable toggle: the script *engine* stays
// on here, only requests Chromium classifies as resourceType 'script' are
// cancelled at the network layer — closer to an ad-blocker, corporate
// firewall, or a dead CDN than to a browser with JavaScript turned off.
// Unlike the CDP override, blocking here isn't tied to a single document —
// once a webContents id is in the set it stays blocked across every future
// navigation, so no per-navigation reapply listener is needed.
const blockedWebviewIds = new Set<number>();
const watchedForDestroy = new Set<number>();

const registerRequestFilter = () => {
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    if (details.resourceType === 'script' && blockedWebviewIds.has(details.webContentsId ?? -1)) {
      callback({cancel: true});
      return;
    }
    callback({});
  });
};

const setNetworkScriptsBlocked = async (
  _: unknown,
  args: SetNetworkScriptsBlockedArgs
): Promise<SetNetworkScriptsBlockedResult> => {
  const {webviewId, blocked} = args;
  if (!isRegisteredWebview(webviewId)) {
    return {status: false};
  }
  const webViewContents = webContents.fromId(webviewId);
  if (webViewContents === undefined) {
    return {status: false};
  }

  if (blocked) {
    blockedWebviewIds.add(webviewId);
  } else {
    blockedWebviewIds.delete(webviewId);
  }

  if (!watchedForDestroy.has(webviewId)) {
    watchedForDestroy.add(webviewId);
    webViewContents.once('destroyed', () => {
      blockedWebviewIds.delete(webviewId);
      watchedForDestroy.delete(webviewId);
    });
  }

  // A plain reload() can be satisfied entirely from the HTTP cache, in which
  // case Chromium never issues a fresh network request for the script and
  // this filter never gets a chance to see it — bypassing the cache is what
  // makes toggling this reliably observable, on a first visit or a hundredth.
  webViewContents.reloadIgnoringCache();
  return {status: true};
};

export const initNetworkScriptBlockerHandlers = () => {
  registerRequestFilter();
  ipcMain.removeHandler(IPC_MAIN_CHANNELS.SET_NETWORK_SCRIPTS_BLOCKED);
  ipcMain.handle(IPC_MAIN_CHANNELS.SET_NETWORK_SCRIPTS_BLOCKED, setNetworkScriptsBlocked);
};
