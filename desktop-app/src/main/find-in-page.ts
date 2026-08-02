import {app, BrowserWindow, ipcMain, webContents} from 'electron';

export interface FindInPageArgs {
  webContentsId: number;
  text: string;
  options?: {
    forward?: boolean;
    findNext?: boolean;
    matchCase?: boolean;
  };
}

export interface FindInPageResult {
  requestId: number;
}

export interface StopFindInPageArgs {
  webContentsId: number;
  action?: 'clearSelection' | 'keepSelection' | 'activateSelection';
}

export interface StopFindInPageResult {
  done: boolean;
}

export interface FindInPageMatchResult {
  webContentsId: number;
  activeMatchOrdinal: number;
  matches: number;
  finalUpdate: boolean;
}

export const initFindInPageHandlers = (mainWindow: BrowserWindow) => {
  // Track which webContents have the found-in-page listener attached
  // to avoid duplicate listeners.
  const listenersAttached = new Set<number>();

  const ensureResultListener = (wc: Electron.WebContents) => {
    if (listenersAttached.has(wc.id)) {
      return;
    }
    listenersAttached.add(wc.id);

    wc.on('found-in-page', (_event, result) => {
      if (mainWindow.isDestroyed()) return;
      const payload: FindInPageMatchResult = {
        webContentsId: wc.id,
        activeMatchOrdinal: result.activeMatchOrdinal,
        matches: result.matches,
        finalUpdate: result.finalUpdate,
      };
      mainWindow.webContents.send('find-in-page-result', payload);
    });

    wc.once('destroyed', () => {
      listenersAttached.delete(wc.id);
    });
  };

  ipcMain.handle('find-in-page', async (_, arg: FindInPageArgs): Promise<FindInPageResult> => {
    const contents = webContents.fromId(arg.webContentsId);
    if (contents == null || contents.isDestroyed()) {
      return {requestId: -1};
    }

    ensureResultListener(contents);

    try {
      const requestId = contents.findInPage(arg.text, arg.options);
      return {requestId};
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('findInPage error:', err);
      return {requestId: -1};
    }
  });

  ipcMain.handle(
    'stop-find-in-page',
    async (_, arg: StopFindInPageArgs): Promise<StopFindInPageResult> => {
      const contents = webContents.fromId(arg.webContentsId);
      if (contents == null || contents.isDestroyed()) {
        return {done: false};
      }

      try {
        contents.stopFindInPage(arg.action ?? 'clearSelection');
        return {done: true};
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('stopFindInPage error:', err);
        return {done: false};
      }
    }
  );

  // Forward Escape key from webview guests to the renderer so the find bar
  // can be closed even when focus is inside a webview.
  app.on('web-contents-created', (_event, wc) => {
    // Only attach to guest webContents (webview tags), not the main window
    if (wc.id === mainWindow.webContents.id) return;

    wc.on('before-input-event', (_e, input) => {
      if (input.key === 'Escape' && input.type === 'keyDown' && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('close-find-bar');
      }
    });
  });
};
