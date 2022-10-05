import { BrowserView, BrowserWindow, ipcMain, webContents } from 'electron';

let devtoolsView: BrowserView | undefined;
let webViewContents: Electron.WebContents;

export const initDevtoolsHandlers = (window: BrowserWindow | null) => {
  ipcMain.handle('open-devtools', async (event, arg) => {
    const { webviewId } = arg;
    if (window == null) {
      return;
    }
    const windowBounds = window.getBounds();
    webViewContents = webContents.fromId(webviewId);
    devtoolsView = new BrowserView();
    window.setBrowserView(devtoolsView);
    const height = 400;
    devtoolsView.setBounds({
      x: 0,
      y: windowBounds.height - height,
      width: windowBounds.width,
      height,
    });
    webViewContents.setDevToolsWebContents(devtoolsView.webContents);
    webViewContents.openDevTools();
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

    return { test: true };
  });

  ipcMain.handle('resize-devtools', async (event, arg) => {
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

  ipcMain.handle('close-devtools', async (event, arg) => {
    if (webViewContents == null) {
      return;
    }
    webViewContents.closeDevTools();
    if (devtoolsView == null) {
      return;
    }
    window?.removeBrowserView(devtoolsView);
    devtoolsView = undefined;
  });
};
