/* eslint-disable @typescript-eslint/no-explicit-any -- CDP payloads are untyped by Electron */
import {BrowserWindow, ipcMain, webContents, WebContentsView} from 'electron';
import {DOCK_POSITION, IPC_MAIN_CHANNELS} from '../../common/constants';
import {DockPosition} from '../../renderer/store/features/devtools';
import log from '../logging';
import {isRegisteredWebview} from '../webview-registry';

let devtoolsView: WebContentsView | undefined;
// A WebContentsView is a native child view: it always paints above the page,
// so any DOM modal or popover overlapping it is occluded (#694/#651). The
// renderer reports when an overlay is open and we detach the view meanwhile.
let devtoolsBounds: Electron.Rectangle | undefined;
let overlayOpen = false;
let devtoolsWebview: Electron.WebContents;
let mainWindow: BrowserWindow | undefined;

export interface OpenDevtoolsArgs {
  webviewId: number;
  dockPosition: DockPosition;
  bounds?: Electron.Rectangle;
}

export interface ResizeDevtoolsArgs {
  bounds: Electron.Rectangle;
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
  coords: {x: number; y: number};
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
    coords: {x, y},
    webviewId,
  };
  mainWindow?.webContents.send(IPC_MAIN_CHANNELS.INSPECT_ELEMENT, args);
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
  const {webviewId} = args;
  if (!isRegisteredWebview(webviewId)) {
    return {status: false};
  }
  const webViewContents = webContents.fromId(webviewId);
  if (webViewContents === undefined) {
    return {status: false};
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
      contentColor: {r: 111, g: 168, b: 220, a: 0.66},
      paddingColor: {r: 147, g: 196, b: 125, a: 0.66},
      borderColor: {r: 255, g: 229, b: 153, a: 0.66},
      marginColor: {r: 246, g: 178, b: 107, a: 0.66},
    },
  });
  return {status: true};
};

const disableInspector = async (
  _: any,
  args: ToggleInspectorArgs
): Promise<ToggleInspectorResult> => {
  const {webviewId} = args;
  if (!isRegisteredWebview(webviewId)) {
    return {status: false};
  }
  const webViewContents = webContents.fromId(webviewId);
  if (webViewContents === undefined) {
    return {status: false};
  }
  const dbg = webViewContents.debugger;
  try {
    await dbg.sendCommand('Overlay.setInspectMode', {
      mode: 'none',
      highlightConfig: {},
    });

    dbg.removeAllListeners().detach();
  } catch (err) {
    log.warn('Error detaching debugger', err);
  }
  return {status: true};
};

const openDevtools = async (_: any, arg: OpenDevtoolsArgs): Promise<OpenDevtoolsResult> => {
  const {webviewId, dockPosition} = arg;
  if (!isRegisteredWebview(webviewId)) {
    return {status: false};
  }
  const optionalWebview = webContents.fromId(webviewId);
  if (mainWindow == null || optionalWebview === undefined) {
    return {status: false};
  }
  devtoolsWebview = optionalWebview;
  if (dockPosition === DOCK_POSITION.UNDOCKED) {
    devtoolsWebview.openDevTools({mode: 'detach'});
    return {status: true};
  }
  devtoolsView = new WebContentsView();
  devtoolsWebview.setDevToolsWebContents(devtoolsView.webContents);
  devtoolsWebview.openDevTools();

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
            // Chromium >=150 hosts the main tabbed pane at '.main-tabbed-pane';
            // older versions wrapped it in 'div[slot="insertion-point-main"]'.
            const pane = document.querySelector('.main-tabbed-pane') || document.querySelector('div[slot="insertion-point-main"]');
            pane.shadowRoot.querySelector('devtools-toolbar.tabbed-pane-left-toolbar, .tabbed-pane-left-toolbar.toolbar').style.display = 'none'
            done = true
          } catch(err){
            await sleep(100);
          }
        }
      })()
    `
    )
    .catch((err) => {
      log.warn('Error removing the native inspect button', err);
    });

  return {status: true};
};

/** Attaches or detaches the devtools view to match the current overlay state. */
const applyDevtoolsPlacement = () => {
  if (devtoolsView == null || mainWindow == null) {
    return;
  }
  try {
    const isAttached = mainWindow.contentView.children.includes(devtoolsView);
    if (overlayOpen) {
      if (isAttached) {
        mainWindow.contentView.removeChildView(devtoolsView);
      }
      return;
    }
    if (!isAttached) {
      mainWindow.contentView.addChildView(devtoolsView);
    }
    if (devtoolsBounds !== undefined) {
      devtoolsView.setBounds(devtoolsBounds);
    }
  } catch (err) {
    log.error('Error placing devtools', err);
  }
};

const resizeDevtools = async (_: any, arg: ResizeDevtoolsArgs) => {
  devtoolsBounds = arg.bounds;
  applyDevtoolsPlacement();
};

const setOverlayOpen = async (_: any, arg: {isOpen: boolean}) => {
  overlayOpen = arg.isOpen;
  applyDevtoolsPlacement();
};

const closeDevTools = async () => {
  if (devtoolsWebview == null) {
    return;
  }
  devtoolsWebview.closeDevTools();
  if (devtoolsView == null) {
    return;
  }
  mainWindow?.contentView.removeChildView(devtoolsView);
  devtoolsView.webContents.close();
  devtoolsView = undefined;
  devtoolsBounds = undefined;
};

export const initDevtoolsHandlers = (_mainWindow: BrowserWindow | undefined) => {
  mainWindow = _mainWindow;

  ipcMain.removeHandler(IPC_MAIN_CHANNELS.OPEN_DEVTOOLS);
  ipcMain.handle(IPC_MAIN_CHANNELS.OPEN_DEVTOOLS, openDevtools);

  ipcMain.removeHandler(IPC_MAIN_CHANNELS.RESIZE_DEVTOOLS);
  ipcMain.handle(IPC_MAIN_CHANNELS.RESIZE_DEVTOOLS, resizeDevtools);

  ipcMain.removeHandler(IPC_MAIN_CHANNELS.CLOSE_DEVTOOLS);
  ipcMain.handle(IPC_MAIN_CHANNELS.CLOSE_DEVTOOLS, closeDevTools);

  ipcMain.removeHandler(IPC_MAIN_CHANNELS.SET_OVERLAY_OPEN);
  ipcMain.handle(IPC_MAIN_CHANNELS.SET_OVERLAY_OPEN, setOverlayOpen);

  ipcMain.removeHandler(IPC_MAIN_CHANNELS.ENABLE_INSPECTOR_OVERLAY);
  ipcMain.handle(IPC_MAIN_CHANNELS.ENABLE_INSPECTOR_OVERLAY, enableInspector);

  ipcMain.removeHandler(IPC_MAIN_CHANNELS.DISABLE_INSPECTOR_OVERLAY);
  ipcMain.handle(IPC_MAIN_CHANNELS.DISABLE_INSPECTOR_OVERLAY, disableInspector);
};
