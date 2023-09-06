import { BrowserView, BrowserWindow, ipcMain, webContents } from 'electron';
import { DOCK_POSITION } from '../../common/constants';
import { DockPosition } from '../../renderer/store/features/devtools';

let devtoolsBrowserView: BrowserView | undefined;
let devtoolsWebview: Electron.WebContents;
let mainWindow: BrowserWindow | undefined;

export interface OpenDevtoolsArgs {
  webviewId: number;
  dockPosition: DockPosition;
  bounds?: Electron.Rectangle;
}

export interface OpenDevtoolsResult {
  status: boolean;
}

export interface ToggleInspectorArgs {
  webviewId: number;
}

export interface ToggleInspectorResult {
  status: boolean;
}

export interface InspectElementArgs {
  coords: { x: number; y: number };
  webviewId: number;
}

const onInspectNodeRequested = async (
  backendNodeId: number,
  dbg: Electron.Debugger,
  webviewId: number
) => {
  const [
    {
      model: {
        content: [x, y],
      },
    },
  ] = await Promise.all([
    dbg.sendCommand('DOM.getBoxModel', {
      backendNodeId,
    }),
    dbg.sendCommand('Overlay.setInspectMode', {
      mode: 'none',
      highlightConfig: {},
    }),
  ]);

  const args: InspectElementArgs = {
    coords: { x, y },
    webviewId,
  };
  mainWindow?.webContents.send('inspect-element', args);
};

const onDebuggerEvent = async (
  _: any,
  method: string,
  params: any,
  dbg: Electron.Debugger,
  webviewId: number
) => {
  switch (method) {
    case 'Overlay.inspectNodeRequested':
      await onInspectNodeRequested(params.backendNodeId, dbg, webviewId);
      break;
    default:
      break;
  }
};

const enableInspector = async (
  _: any,
  args: ToggleInspectorArgs
): Promise<ToggleInspectorResult> => {
  const { webviewId } = args;
  const webViewContents = webContents.fromId(webviewId);
  if (webViewContents === undefined) {
    return { status: false };
  }

  const dbg = webViewContents.debugger;
  if (!dbg.isAttached()) {
    dbg.attach();
    dbg.on('message', (__: any, method: string, params: any) => {
      onDebuggerEvent(__, method, params, dbg, webviewId);
    });
  }
  await dbg.sendCommand('DOM.enable');
  await dbg.sendCommand('Overlay.enable');
  await dbg.sendCommand('Overlay.setInspectMode', {
    mode: 'searchForNode',
    highlightConfig: {
      showInfo: true,
      showStyles: true,
      contentColor: { r: 111, g: 168, b: 220, a: 0.66 },
      paddingColor: { r: 147, g: 196, b: 125, a: 0.66 },
      borderColor: { r: 255, g: 229, b: 153, a: 0.66 },
      marginColor: { r: 246, g: 178, b: 107, a: 0.66 },
    },
  });
  return { status: true };
};

const disableInspector = async (
  _: any,
  args: ToggleInspectorArgs
): Promise<ToggleInspectorResult> => {
  const { webviewId } = args;
  const webViewContents = webContents.fromId(webviewId);
  if (webViewContents === undefined) {
    return { status: false };
  }
  const dbg = webViewContents.debugger;
  try {
    await dbg.sendCommand('Overlay.setInspectMode', {
      mode: 'none',
      highlightConfig: {},
    });

    dbg.removeAllListeners().detach();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Error detaching debugger', err);
  }
  return { status: true };
};

const openDevtools = async (
  _: any,
  arg: OpenDevtoolsArgs
): Promise<OpenDevtoolsResult> => {
  const { webviewId, dockPosition } = arg;
  const optionalWebview = webContents.fromId(webviewId);
  if (mainWindow == null || optionalWebview === undefined) {
    return { status: false };
  }
  devtoolsWebview = optionalWebview;
  if (dockPosition === DOCK_POSITION.UNDOCKED) {
    devtoolsWebview.openDevTools({ mode: 'detach' });
    return { status: true };
  }
  devtoolsBrowserView = new BrowserView();
  mainWindow.setBrowserView(devtoolsBrowserView);
  devtoolsBrowserView.setBounds({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  devtoolsWebview.setDevToolsWebContents(devtoolsBrowserView.webContents);
  devtoolsWebview.openDevTools();

  devtoolsBrowserView.webContents
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
      // eslint-disable-next-line no-console
      console.error('Error removing the native inspect button', err);
    });

  return { status: true };
};

const resizeDevtools = async (_: any, arg: OpenDevtoolsArgs) => {
  try {
    if (devtoolsBrowserView == null) {
      return;
    }
    const { bounds } = arg;
    if (bounds == null) {
      return;
    }
    const { x, y, width, height } = bounds;
    devtoolsBrowserView.setBounds({
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(width),
      height: Math.round(height),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error resizing devtools', err);
  }
};

const closeDevTools = async () => {
  if (devtoolsWebview == null) {
    return;
  }
  devtoolsWebview.closeDevTools();
  if (devtoolsBrowserView == null) {
    return;
  }
  mainWindow?.removeBrowserView(devtoolsBrowserView);
  (devtoolsBrowserView.webContents as any).destroy();
  devtoolsBrowserView.webContents.close();
  devtoolsBrowserView = undefined;
};

export const initDevtoolsHandlers = (
  _mainWindow: BrowserWindow | undefined
) => {
  mainWindow = _mainWindow;

  ipcMain.removeHandler('open-devtools');
  ipcMain.handle('open-devtools', openDevtools);

  ipcMain.removeHandler('resize-devtools');
  ipcMain.handle('resize-devtools', resizeDevtools);

  ipcMain.removeHandler('close-devtools');
  ipcMain.handle('close-devtools', closeDevTools);

  ipcMain.removeHandler('enable-inspector-overlay');
  ipcMain.handle('enable-inspector-overlay', enableInspector);

  ipcMain.removeHandler('disable-inspector-overlay');
  ipcMain.handle('disable-inspector-overlay', disableInspector);
};
