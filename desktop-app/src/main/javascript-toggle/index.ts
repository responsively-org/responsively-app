/* eslint-disable @typescript-eslint/no-explicit-any -- CDP payloads are untyped by Electron */
import {ipcMain, webContents} from 'electron';
import {IPC_MAIN_CHANNELS} from '../../common/constants';
import log from '../logging';
import {isRegisteredWebview} from '../webview-registry';

export interface SetJavascriptEnabledArgs {
  webviewId: number;
  enabled: boolean;
}

export interface SetJavascriptEnabledResult {
  status: boolean;
}

// Emulation.setScriptExecutionDisabled is a per-navigation CDP override, not
// page/document state — Chromium resets it on the next navigation. Track the
// last-requested state per guest so it can be resent before every subsequent
// navigation (reload, link click, address change), not just applied once.
const disabledByWebviewId = new Map<number, boolean>();

const applyScriptExecutionDisabled = async (dbg: Electron.Debugger, disabled: boolean) => {
  if (!dbg.isAttached()) {
    dbg.attach();
  }
  await dbg.sendCommand('Page.enable');
  await dbg.sendCommand('Emulation.setScriptExecutionDisabled', {value: disabled});
};

// <webview> exposes no post-mount "javascript enabled" attribute, so this
// goes through CDP instead. Emulation.setScriptExecutionDisabled only stops
// *future* script execution, so a reload is required for the toggle to be
// visibly consistent with the page already on screen.
const setJavascriptEnabled = async (
  _: any,
  args: SetJavascriptEnabledArgs
): Promise<SetJavascriptEnabledResult> => {
  const {webviewId, enabled} = args;
  if (!isRegisteredWebview(webviewId)) {
    return {status: false};
  }
  const webViewContents = webContents.fromId(webviewId);
  if (webViewContents === undefined) {
    return {status: false};
  }

  const isFirstToggle = !disabledByWebviewId.has(webviewId);
  disabledByWebviewId.set(webviewId, !enabled);

  try {
    await applyScriptExecutionDisabled(webViewContents.debugger, !enabled);
  } catch (err) {
    log.warn('Error toggling JavaScript execution', err);
    disabledByWebviewId.delete(webviewId);
    return {status: false};
  }

  if (isFirstToggle) {
    // The debugger itself is detached centrally on guest teardown (see
    // webview-registry.ts) — here we only need to forget our own bookkeeping.
    webViewContents.on('did-start-navigation', () => {
      const stillDisabled = disabledByWebviewId.get(webviewId);
      if (stillDisabled === undefined) {
        return;
      }
      applyScriptExecutionDisabled(webViewContents.debugger, stillDisabled).catch((err) => {
        log.warn('Error reapplying JavaScript execution state on navigation', err);
      });
    });
    webViewContents.once('destroyed', () => {
      disabledByWebviewId.delete(webviewId);
    });
  }

  webViewContents.reload();
  return {status: true};
};

export const initJavascriptToggleHandlers = () => {
  ipcMain.removeHandler(IPC_MAIN_CHANNELS.SET_JAVASCRIPT_ENABLED);
  ipcMain.handle(IPC_MAIN_CHANNELS.SET_JAVASCRIPT_ENABLED, setJavascriptEnabled);
};
