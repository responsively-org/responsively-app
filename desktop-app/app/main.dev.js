/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
require('dotenv').config();
import electron, {
  app,
  BrowserWindow,
  BrowserView,
  globalShortcut,
  ipcMain,
  nativeTheme,
  webContents,
} from 'electron';
import settings from 'electron-settings';
import log from 'electron-log';
import MenuBuilder from './menu';
import {USER_PREFERENCES} from './constants/settingKeys';
import * as Sentry from '@sentry/electron';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer';
import devtron from 'devtron';
import fs from 'fs';
import {migrateDeviceSchema} from './settings/migration';
import {DEVTOOLS_MODES} from './constants/previewerLayouts';
import {initMainShortcutManager} from './shortcut-manager/main-shortcut-manager';
import console from 'electron-timber';
import {appUpdater} from './app-updater';

const path = require('path');

migrateDeviceSchema();

if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    dsn: 'https://f2cdbc6a88aa4a068a738d4e4cfd3e12@sentry.io/1553155',
  });
}

const protocol = 'responsively';

let hasActiveWindow = false;

let mainWindow = null;
let urlToOpen = null;
let devToolsView = null;

let httpAuthCallbacks = {};

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')({isEnabled: true});
}

const installExtensions = async () => {
  const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS];
  try {
    await installExtension(extensions);
    devtron.install();
  } catch (err) {
    console.log('Error installing extensions', err);
  }
};

const openUrl = url => {
  mainWindow.webContents.send(
    'address-change',
    url.replace(`${protocol}://`, '')
  );
  mainWindow.show();
};

/**
 * Add event listeners...
 */

app.on('will-finish-launching', () => {
  if (process.platform === 'win32') {
    urlToOpen = process.argv.filter(i => /^responsively/.test(i))[0];
  }
  if (['win32', 'darwin'].includes(process.platform)) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(protocol, process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    } else {
      app.setAsDefaultProtocolClient(protocol);
    }
  }
});

app.on('open-url', async (event, url) => {
  if (mainWindow) {
    openUrl(url);
  } else {
    urlToOpen = url;
    if (!hasActiveWindow) {
      createWindow();
    }
  }
});

app.on('window-all-closed', () => {
  if (false && process.env.NODE_ENV === 'development') {
    ['win32', 'darwin'].includes(process.platform) &&
      app.removeAsDefaultProtocolClient(protocol);
  }
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  hasActiveWindow = false;
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on(
  'certificate-error',
  (event, webContents, url, error, certificate, callback) => {
    if ((settings.get(USER_PREFERENCES) || {}).disableSSLValidation === true) {
      event.preventDefault();
      callback(true);
    }
  }
);

app.on('login', (event, webContents, request, authInfo, callback) => {
  event.preventDefault();
  const {url} = request;
  if (httpAuthCallbacks[url]) {
    return httpAuthCallbacks[url].push(callback);
  }
  httpAuthCallbacks[url] = [callback];
  mainWindow.webContents.send('http-auth-prompt', {url});
});

const createWindow = async () => {
  hasActiveWindow = true;
  if (process.env.NODE_ENV === 'development') {
    await installExtensions();
  }

  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;

  let iconPath = path.resolve(__dirname, '../resources/icons/64x64.png');
  mainWindow = new BrowserWindow({
    show: false,
    width,
    height,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webviewTag: true,
      enableRemoteModule: true,
    },
    titleBarStyle: 'hidden',
    icon: iconPath,
  });

  ipcMain.removeAllListeners();

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.webContents.on('did-finish-load', function() {
    if (process.platform === 'darwin') {
      // Trick to make the transparent title bar draggable
      mainWindow.webContents.executeJavaScript(`
        var div = document.createElement("div");
        div.style.position = "absolute";
        div.style.top = 0;
        div.style.height = "23px";
        div.style.width = "100%";
        div.style["-webkit-app-region"] = "drag";
        div.style['-webkit-user-select'] = 'none';
        document.body.appendChild(div);
      `);
    }
  });

  initMainShortcutManager();

  const onResize = () => {
    const [width, height] = mainWindow.getContentSize();
    mainWindow.webContents.send('window-resize', {height, width});
  };

  mainWindow.on('resize', onResize);

  mainWindow.once('ready-to-show', () => {
    if (urlToOpen) {
      openUrl(urlToOpen);
      urlToOpen = null;
    } else {
      mainWindow.show();
    }
    onResize();
  });

  ipcMain.on('http-auth-promt-response', (event, ...args) => {
    if (!args[0].url) {
      return;
    }
    const {url, username, password} = args[0];
    if (!httpAuthCallbacks[url]) {
      return;
    }
    httpAuthCallbacks[url].forEach(cb => cb(username, password));
    httpAuthCallbacks[url] = null;
  });

  ipcMain.on('prefers-color-scheme-select', (event, scheme) => {
    nativeTheme.themeSource = scheme || 'system';
  });

  ipcMain.handle('install-extension', async (event, id) => {
    return installExtension(id, true);
  });

  ipcMain.on('uninstall-extension', (event, name) => {
    return BrowserWindow.removeDevToolsExtension(name);
  });

  ipcMain.on('open-devtools', (event, ...args) => {
    const {webViewId, bounds, mode} = args[0];
    if (!webViewId) {
      return;
    }
    const webView = webContents.fromId(webViewId);

    if (mode === DEVTOOLS_MODES.UNDOCKED) {
      return webView.openDevTools();
    }

    devToolsView = new BrowserView();
    mainWindow.setBrowserView(devToolsView);
    devToolsView.setBounds(bounds);
    webView.setDevToolsWebContents(devToolsView.webContents);
    webView.openDevTools();
    devToolsView.webContents.executeJavaScript(`
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
    `);
  });

  ipcMain.on('close-devtools', (event, ...args) => {
    const {webViewId} = args[0];
    if (!webViewId) {
      return;
    }
    webContents.fromId(webViewId).closeDevTools();
    if (!devToolsView) {
      return;
    }
    mainWindow.removeBrowserView(devToolsView);
    devToolsView.destroy();
    devToolsView = null;
  });

  ipcMain.on('resize-devtools', (event, ...args) => {
    const {bounds} = args[0];
    if (!bounds || !devToolsView) {
      return;
    }
    devToolsView.setBounds(bounds);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  appUpdater.on('status-changed', nextStatus => {
    menuBuilder.buildMenu(true);
    mainWindow.webContents.send('updater-status-changed', {nextStatus});
  });
  // Remove this if your app does not use auto updates
  appUpdater.checkForUpdatesAndNotify();
};

app.on('activate', (event, hasVisibleWindows) => {
  if (hasVisibleWindows) {
    return;
  }
  createWindow();
});

app.on('ready', createWindow);
