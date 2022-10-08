import { BrowserView, BrowserWindow, ipcMain, webContents } from 'electron';
import { DOCK_POSITION } from '../../common/constants';
import { DockPosition } from '../../renderer/store/features/devtools';

let devtoolsView: BrowserView | undefined;
let webViewContents: Electron.WebContents;

export interface OpenDevtoolsArgs {
  webviewId: number;
  dockPosition: DockPosition;
  bounds?: Electron.Rectangle;
}

export interface OpenDevtoolsResult {
  status: boolean;
}

export const initDevtoolsHandlers = (mainWindow: BrowserWindow | null) => {
  ipcMain.handle(
    'open-devtools',
    async (_, arg: OpenDevtoolsArgs): Promise<OpenDevtoolsResult> => {
      console.log('open-devtools', arg);
      const { webviewId, dockPosition } = arg;
      if (mainWindow == null) {
        return { status: false };
      }
      webViewContents = webContents.fromId(webviewId);
      if (dockPosition === DOCK_POSITION.UNDOCKED) {
        console.log('Opening undocked devtools');
        webViewContents.openDevTools({ mode: 'detach' });
        return { status: true };
      }
      devtoolsView = new BrowserView();
      mainWindow.setBrowserView(devtoolsView);
      devtoolsView.setBounds({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
      webViewContents.setDevToolsWebContents(devtoolsView.webContents);
      webViewContents.openDevTools();

      /*
      devtoolsView.webContents
      .executeJavaScript(
        `
          (async function () {
            const sleep = ms => (new Promise(resolve => setTimeout(resolve, ms)));
            var retryCount = 0;
            var done = false;
            while(retryCount < 10 && !done) {
              try {
                retryCount++;
                document.querySelectorAll('div[slot="insertion-point-main"]')[0].shadowRoot.querySelectorAll('.tabbed-pane-left-toolbar.toolbar')[0].style.display = 'none'
                done = true
              } catch(err){
                await sleep(100);
              }
            }
          })()
        `
      )
      .catch((err) => {
        console.log('error', err);
      });
      */

      return { status: true };
    }
  );

  ipcMain.handle('resize-devtools', async (_, arg) => {
    if (devtoolsView == null) {
      return;
    }
    const { bounds } = arg;
    if (bounds == null) {
      return;
    }
    const { x, y, width, height } = bounds;
    devtoolsView.setBounds({
      x,
      y,
      width,
      height,
    });
  });

  ipcMain.handle('close-devtools', async () => {
    if (webViewContents == null) {
      return;
    }
    webViewContents.closeDevTools();
    if (devtoolsView == null) {
      return;
    }
    mainWindow?.removeBrowserView(devtoolsView);
    (devtoolsView.webContents as any).destroy();
    devtoolsView = undefined;
  });
};
