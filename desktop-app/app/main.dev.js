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
import electron, {app, BrowserWindow, ipcMain} from 'electron';
import {autoUpdater} from 'electron-updater';
import settings from 'electron-settings';
import log from 'electron-log';
import MenuBuilder from './menu';
import {ACTIVE_DEVICES} from './constants/settingKeys';
import * as Sentry from '@sentry/electron';

const path = require('path');

if (process.env.NODE_ENV !== 'development') {
    Sentry.init({
        dsn: 'https://f2cdbc6a88aa4a068a738d4e4cfd3e12@sentry.io/1553155',
    });
}

export default class AppUpdater {
    constructor() {
        log.transports.file.level = 'info';
        autoUpdater.logger = log;
        autoUpdater.checkForUpdatesAndNotify();
    }
}

let mainWindow = null;

let httpAuthCallbacks = {};

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
) {
    require('electron-debug')();
}

const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

    return Promise.all(
        extensions.map(name =>
            installer.default(installer[name], forceDownload)
        )
    ).catch(console.log);
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
        },
        titleBarStyle: 'hidden',
        icon: iconPath,
    });

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
