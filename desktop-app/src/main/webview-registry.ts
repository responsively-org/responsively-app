import {WebContents} from 'electron';
import store from '../store';
import log from './logging';
import {decidePopupAction, PopupBehavior} from './popup-policy';

// Guest webContents ids tracked straight from did-attach-webview, so the set
// cannot be spoofed through IPC. IPC handlers that take a webContentsId must
// validate against it — otherwise a caller could aim executeJavaScript /
// loadURL / clearStorageData at any webContents, including the app shell.
const registeredWebviewIds = new Set<number>();

export const isRegisteredWebview = (webContentsId: number): boolean =>
  registeredWebviewIds.has(webContentsId);

export interface WebviewSecurityDeps {
  openInPreview: (url: string) => void;
  openExternal: (url: string) => void;
}

// Event mirroring replays a popup-triggering click in every preview, so one
// user click surfaces one window.open per device. Collapse identical URLs
// arriving within this window to a single action (one browser tab, not N).
const POPUP_DEDUP_WINDOW_MS = 500;
let lastPopup: {url: string; ts: number} | null = null;

const isDuplicatePopup = (url: string): boolean => {
  const now = Date.now();
  if (lastPopup !== null && lastPopup.url === url && now - lastPopup.ts < POPUP_DEDUP_WINDOW_MS) {
    return true;
  }
  lastPopup = {url, ts: now};
  return false;
};

/**
 * Per-window guest wiring: registers every attached <webview>, enforces safe
 * webPreferences before attach, and routes window.open / target=_blank out of
 * guests according to the user's popup setting (previews get `allowpopups`,
 * but a guest window itself must never spawn).
 */
export const wireWebviewSecurity = (hostContents: WebContents, deps: WebviewSecurityDeps) => {
  hostContents.on('will-attach-webview', (_event, webPreferences) => {
    webPreferences.nodeIntegration = false;
    const preload = webPreferences.preload ?? '';
    if (preload !== '' && !preload.includes('preload-webview')) {
      log.warn('[webview] blocked unexpected preload script', preload);
      delete webPreferences.preload;
    }
  });

  hostContents.on('did-attach-webview', (_event, guestContents) => {
    const {id} = guestContents;
    registeredWebviewIds.add(id);
    guestContents.once('destroyed', () => {
      registeredWebviewIds.delete(id);
    });

    guestContents.setWindowOpenHandler((details) => {
      if (isDuplicatePopup(details.url)) {
        return {action: 'deny'};
      }
      const behavior = (store.get('userPreferences.popupBehavior') ??
        'in-preview') as PopupBehavior;
      const action = decidePopupAction(details.url, behavior);
      if (action.kind === 'in-preview') {
        deps.openInPreview(action.url);
      } else if (action.kind === 'external') {
        deps.openExternal(action.url);
      } else {
        log.info('[webview] blocked popup', details.url);
      }
      return {action: 'deny'};
    });
  });
};
