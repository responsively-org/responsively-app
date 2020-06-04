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
  webContents,
} from 'electron';
import {autoUpdater} from 'electron-updater';
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

const path = require('path');

migrateDeviceSchema();

if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    dsn: 'https://f2cdbc6a88aa4a068a738d4e4cfd3e12@sentry.io/1553155',
  });
}

const protocol = 'responsively';

let hasActiveWindow = false;

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;
let urlToOpen = null;
let bottomDevTools = null;

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
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS];
  try {
    const statuses = await installExtension(extensions);
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
  console.log('Sending HTTP Auth Prompt', {url});
  if (httpAuthCallbacks[url]) {
    return httpAuthCallbacks[url].push(callback);
  }
  httpAuthCallbacks[url] = [callback];
  mainWindow.webContents.send('http-auth-prompt', {url});
});

const createWindow = async () => {
  hasActiveWindow = true;
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
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
  bottomDevTools = new BrowserView();
  mainWindow.setBrowserView(bottomDevTools);

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

  mainWindow.once('ready-to-show', () => {
    if (urlToOpen) {
      openUrl(urlToOpen);
      urlToOpen = null;
    }
    mainWindow.show();
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

  ipcMain.on('open-devtools-global', (event, ...args) => {
    const {webViewId} = args[0];
    if (!webViewId) {
      return;
    }
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;

    let viewHeight = Math.round(height * 0.3);
    console.log('viewHeight', viewHeight);
    bottomDevTools.setBounds({
      x: 0,
      y: height - viewHeight,
      width: width,
      height: viewHeight,
    });

    const webView = webContents.fromId(webViewId);
    webView.setDevToolsWebContents(bottomDevTools.webContents);
    webView.openDevTools();
  });

  ipcMain.on('close-devtools', (event, ...args) => {
    if (!bottomDevTools) {
      return;
    }
    bottomDevTools.setBounds({...bottomDevTools.getBounds(), y: 0, height: 0});
    bottomDevTools.webContents.loadURL('about:blank');
  });

  ipcMain.on('resize-devtools', (event, ...args) => {
    const {size} = args[0];
    console.log('size, bottomDevTools', size, bottomDevTools);
    if (!size || !bottomDevTools) {
      return;
    }
    const viewHeight = Math.round(size.height);
    bottomDevTools.setBounds({
      x: 0,
      y: height - viewHeight,
      width: width,
      height: viewHeight,
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

app.on('activate', (event, hasVisibleWindows) => {
  if (hasVisibleWindows) {
    return;
  }
  createWindow();
});

app.on('ready', createWindow);
