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
import { app, BrowserWindow, shell, screen, ipcMain } from 'electron';
import { setupTitlebar } from 'custom-electron-titlebar/main';
import cli from './cli';
import { PROTOCOL } from '../common/constants';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import {
  BROWSER_SYNC_HOST,
  initInstance,
  stopWatchFiles,
  watchFiles,
} from './browser-sync';
import store from '../store';
import { initWebviewContextMenu } from './webview-context-menu/register';
import { initScreenshotHandlers } from './screenshot';
import { initDevtoolsHandlers } from './devtools';
import { initWebviewStorageManagerHandlers } from './webview-storage-manager';
import { initNativeFunctionHandlers } from './native-functions';
import { WebPermissionHandlers } from './web-permissions';
import { initHttpBasicAuthHandlers } from './http-basic-auth';
import { initAppMetaHandlers } from './app-meta';
import { openUrl } from './protocol-handler';
import { AppUpdater } from './app-updater';

let windowShownOnOpen = false;

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

let urlToOpen: string | undefined = cli.input[0]?.includes('electronmon')
  ? undefined
  : cli.input[0];

let mainWindow: BrowserWindow | null = null;

initAppMetaHandlers();
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
  const installer = require('electron-devtools-assembler');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS',
    'EMBER_INSPECTOR',
    'BACKBONE_DEBUGGER',
    'JQUERY_DEBUGGER',
    'ANGULAR_DEVTOOLS',
    'VUEJS_DEVTOOLS',
    'MOBX_DEVTOOLS',
    'APOLLO_DEVELOPER_TOOLS',
  ];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

// Custom titlebar config for windows
const customTitlebarStatus = store.get(
  'userPreferences.customTitlebar'
) as boolean;
if (customTitlebarStatus && process.platform === 'win32') {
  setupTitlebar();
}

const createWindow = async () => {
  windowShownOnOpen = false;
  let isAppInitiated = false;
  await installExtensions();

  const setIsAppInitiated = () => {
    isAppInitiated = true;
  };

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
    titleBarStyle:
      customTitlebarStatus && process.platform === 'win32'
        ? 'hidden'
        : 'default',
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

  // Add BROWSER_SYNC_HOST to the allowed Content-Security-Policy origins
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    async (details, callback) => {
      if (details.responseHeaders?.['content-security-policy']) {
        let cspHeader = details.responseHeaders['content-security-policy'][0];

        cspHeader = cspHeader.replace(
          'default-src',
          `default-src ${BROWSER_SYNC_HOST}`
        );
        cspHeader = cspHeader.replace(
          'script-src',
          `script-src ${BROWSER_SYNC_HOST}`
        );
        cspHeader = cspHeader.replace(
          'script-src-elem',
          `script-src-elem ${BROWSER_SYNC_HOST}`
        );
        cspHeader = cspHeader.replace(
          'connect-src',
          `connect-src ${BROWSER_SYNC_HOST} wss://${BROWSER_SYNC_HOST} ws://${BROWSER_SYNC_HOST}`
        );
        cspHeader = cspHeader.replace(
          'child-src',
          `child-src ${BROWSER_SYNC_HOST}`
        );
        cspHeader = cspHeader.replace(
          'worker-src',
          `worker-src ${BROWSER_SYNC_HOST}`
        ); // Required when/if the browser-sync script is eventually relocated to a web worker

        details.responseHeaders['content-security-policy'][0] = cspHeader;
      }
      callback({ responseHeaders: details.responseHeaders });
    }
  );

  mainWindow.loadURL(
    `${resolveHtmlPath('index.html')}?urlToOpen=${encodeURI(
      urlToOpen ?? 'undefined'
    )}`
  );

  const isWindows = process.platform === 'win32';
  let needsFocusFix = false;
  let triggeringProgrammaticBlur = false;

  mainWindow.on('blur', () => {
    if (!triggeringProgrammaticBlur) {
      needsFocusFix = true;
    }
  });

  mainWindow.on('focus', () => {
    if (isWindows && needsFocusFix) {
      needsFocusFix = false;
      triggeringProgrammaticBlur = true;
      setTimeout(function () {
        mainWindow!.blur();
        mainWindow!.focus();
        setTimeout(function () {
          triggeringProgrammaticBlur = false;
        }, 100);
      }, 100);
    }
  });

  mainWindow.on('ready-to-show', async () => {
    if (!isAppInitiated) {
      await initInstance();
      setIsAppInitiated();

      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      webPermissionHandlers.init();
      if (process.env.START_MINIMIZED) {
        mainWindow.minimize();
      } else {
        mainWindow.showInactive();
        if (!windowShownOnOpen) {
          windowShownOnOpen = true;
          mainWindow.show();
        } else {
          mainWindow.showInactive();
        }
      }
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log('window open handler', url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const appUpdater = new AppUpdater();

  const menuBuilder = new MenuBuilder(mainWindow, appUpdater);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  ipcMain.on('start-watching-file', async (event, fileInfo) => {
    let filePath = fileInfo.path.replace('file://', '');
    if (process.platform === 'win32') {
      filePath = filePath.replace(/^\//, '');
    }
    app.addRecentDocument(filePath);
    await stopWatchFiles();
    watchFiles(filePath);
  });

  ipcMain.on('stop-watcher', async () => {
    await stopWatchFiles();
  });
};

app.on('open-url', async (event, url) => {
  let actualURL = url.replace(`${PROTOCOL}://`, '');
  if (actualURL.indexOf('//') !== -1 && actualURL.indexOf('://') === -1) {
    // This hack is needed because the URL from the extension is missing the colon for some reason.
    actualURL = actualURL.replace('//', '://');
  }
  if (mainWindow == null) {
    // Will be handled by opened window
    urlToOpen = actualURL;
    await createWindow();
    return;
  }
  windowShownOnOpen = false;
  openUrl(actualURL, mainWindow);
});

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
