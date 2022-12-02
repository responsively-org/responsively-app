/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn run build` or `yarn run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { IPC_MAIN_CHANNELS } from 'common/constants';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { BROWSER_SYNC_HOST, initInstance } from './browser-sync';
import store from '../store';
import { initWebviewContextMenu } from './webview-context-menu/register';
import { initScreenshotHandlers } from './screenshot';
import { initDevtoolsHandlers } from './devtools';
import { initWebviewStorageManagerHandlers } from './webview-storage-manager';
import { initNativeFunctionHandlers } from './native-functions';
import { WebPermissionHandlers } from './web-permissions';
import { initHttpBasicAuthHandlers } from './http-basic-auth';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.handle(IPC_MAIN_CHANNELS.APP_META, async () => {
  return {
    webviewPreloadPath: app.isPackaged
      ? path.join(__dirname, 'preload-webview.js')
      : path.join(__dirname, '../../.erb/dll/preload-webview.js'),
  };
});

ipcMain.on('electron-store-get', async (event, val) => {
  event.returnValue = store.get(val);
});
ipcMain.on('electron-store-set', async (_, key, val) => {
  store.set(key, val);
});

initWebviewContextMenu();
initScreenshotHandlers();
initWebviewStorageManagerHandlers();
initNativeFunctionHandlers();

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    show: false,
    width,
    height,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      webviewTag: true,
    },
  });
  initDevtoolsHandlers(mainWindow);
  initHttpBasicAuthHandlers(mainWindow);
  const webPermissionHandlers = WebPermissionHandlers(mainWindow);

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', async () => {
    await initInstance();
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    webPermissionHandlers.init();
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log('window open handler', url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('certificate-error', (event, _, url, __, ___, callback) => {
  if (url.indexOf(BROWSER_SYNC_HOST) !== -1) {
    event.preventDefault();
    return callback(true);
  }
  console.log('certificate-error event', url, BROWSER_SYNC_HOST);
  return callback(store.get('userPreferences.allowInsecureSSLConnections'));
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
