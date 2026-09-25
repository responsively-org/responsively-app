import {ipcMain, session, webContents} from 'electron';
import {IPC_MAIN_CHANNELS} from '../../common/constants';
import {getBrowserSyncHost} from '../browser-sync';
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
    // The BrowserSync client script is the app's own event-mirroring
    // transport, injected into every preview regardless of this toggle —
    // it's indistinguishable from a page's own script by resourceType alone,
    // but blocking it would silently drop a device out of scroll/click
    // mirroring instead of just blocking the site's scripts as intended.
    if (
      details.resourceType === 'script' &&
      blockedWebviewIds.has(details.webContentsId ?? -1) &&
      !details.url.includes(getBrowserSyncHost())
    ) {
      callback({cancel: true});
      return;
    }
    callback({});
  });
};

const RELOAD_SETTLE_TIMEOUT_MS = 15_000;

// reloadIgnoringCache() is fire-and-forget — it returns before the reload
// actually starts or commits. Resolving this handler right after calling it
// (as it used to) let a caller's very next action (e.g. an MCP navigate()
// call) race the in-flight reload on the same webContents: two competing
// navigations, and whichever happens to commit last — not necessarily the
// one requested last — wins. Waiting for the reload to genuinely settle
// before resolving closes that window, so callers can rely on this device
// being idle again by the time the promise resolves.
const waitForReloadToSettle = (contents: Electron.WebContents): Promise<void> =>
  new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      contents.removeListener('did-stop-loading', onStopLoading);
      contents.removeListener('did-fail-load', onFailLoad);
      contents.removeListener('destroyed', finish);
      resolve();
    };
    const onStopLoading = () => finish();
    const onFailLoad = (_event: Electron.Event, errorCode: number) => {
      // -3 (ERR_ABORTED) fires for in-page interruptions (e.g. a follow-up
      // navigation superseding this reload) — something else committed, so
      // that's a settle too, not a failure worth surfacing here.
      if (errorCode !== -3) finish();
    };
    contents.once('did-stop-loading', onStopLoading);
    contents.once('did-fail-load', onFailLoad);
    contents.once('destroyed', finish);
    const timer = setTimeout(finish, RELOAD_SETTLE_TIMEOUT_MS);
    contents.reloadIgnoringCache();
  });

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
  await waitForReloadToSettle(webViewContents);
  return {status: true};
};

export const initNetworkScriptBlockerHandlers = () => {
  registerRequestFilter();
  ipcMain.removeHandler(IPC_MAIN_CHANNELS.SET_NETWORK_SCRIPTS_BLOCKED);
  ipcMain.handle(IPC_MAIN_CHANNELS.SET_NETWORK_SCRIPTS_BLOCKED, setNetworkScriptsBlocked);
};
