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
import {app, BrowserWindow, session, shell, ipcMain} from 'electron';
import cli from './cli';
import {IPC_MAIN_CHANNELS, PROTOCOL} from '../common/constants';
import MenuBuilder from './menu';
import {resolveHtmlPath} from './util';
import {
  getBrowserSyncHost,
  getBrowserSyncPort,
  initInstance,
  stopWatchFiles,
  watchFiles,
} from './browser-sync';
import store from '../store';
import {initWebviewContextMenu} from './webview-context-menu/register';
import {initScreenshotHandlers} from './screenshot';
import {initDevtoolsHandlers} from './devtools';
import {initWebviewStorageManagerHandlers} from './webview-storage-manager';
import {initNativeFunctionHandlers} from './native-functions';
import {WebPermissionHandlers} from './web-permissions';
import {initHttpBasicAuthHandlers} from './http-basic-auth';
import {initAppMetaHandlers} from './app-meta';
import {initMcpServer} from './mcp';
import {openUrl} from './protocol-handler';
import {AppUpdater} from './app-updater';
import {getSavedWindowState, trackWindowState} from './window-state';
import log, {initCrashHandlers, initLogging} from './logging';
import {injectHostIntoCsp} from './csp';
import {isOpenableUrl} from './url-validation';
import {wireWebviewSecurity} from './webview-registry';
import {getTitleBarOptions} from './titlebar';

initLogging();
initCrashHandlers();

let windowShownOnOpen = false;
let mainWindow: BrowserWindow | null = null;
let urlToOpen: string | undefined =
  cli.input[0] !== undefined && !cli.input[0].includes('electronmon') && isOpenableUrl(cli.input[0])
    ? cli.input[0]
    : undefined;

const normalizeProtocolUrl = (url: string): string => {
  let actualURL = url.replace(`${PROTOCOL}://`, '');
  if (actualURL.indexOf('//') !== -1 && actualURL.indexOf('://') === -1) {
    // This hack is needed because the URL from the extension is missing the colon for some reason.
    actualURL = actualURL.replace('//', '://');
  }
  return actualURL;
};

// A second launch focuses the running instance instead of spawning a second
// window (which would also silently lose the MCP/browser-sync port races).
// The lock is keyed on userData, so parallel E2E workers with isolated
// E2E_USER_DATA_DIRs are unaffected.
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

app.on('second-instance', (_event, argv) => {
  if (mainWindow !== null && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
  // On Windows/Linux, protocol deep links and CLI URLs arrive on the second
  // instance's argv rather than through 'open-url'.
  const deepLink = argv.find(
    (arg) =>
      arg.startsWith(`${PROTOCOL}://`) ||
      arg.startsWith('http://') ||
      arg.startsWith('https://') ||
      arg.startsWith('file://')
  );
  if (deepLink !== undefined && mainWindow !== null && !mainWindow.isDestroyed()) {
    const actualURL = normalizeProtocolUrl(deepLink);
    if (isOpenableUrl(actualURL)) {
      windowShownOnOpen = false;
      openUrl(actualURL, mainWindow);
    } else {
      log.warn('[deep-link] rejected URL from second instance', deepLink);
    }
  }
});

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

// One-time process-level wiring: IPC handlers and app-level listeners live
// here (never inside createWindow) so macOS close→reopen cannot register
// duplicates. Anything window-dependent receives the getter.
const getMainWindow = () => mainWindow;

initAppMetaHandlers();
initWebviewContextMenu();
initScreenshotHandlers();
initWebviewStorageManagerHandlers();
initNativeFunctionHandlers();
initMcpServer(getMainWindow);
initHttpBasicAuthHandlers(getMainWindow);
const webPermissionHandlers = WebPermissionHandlers(getMainWindow);

ipcMain.on(IPC_MAIN_CHANNELS.GET_BROWSER_SYNC_PORT, (event) => {
  event.returnValue = getBrowserSyncPort();
});

ipcMain.on(IPC_MAIN_CHANNELS.START_WATCHING_FILE, async (_event, fileInfo) => {
  let filePath = fileInfo.path.replace('file://', '');
  if (process.platform === 'win32') {
    filePath = filePath.replace(/^\//, '');
  }
  app.addRecentDocument(filePath);
  await stopWatchFiles();
  watchFiles(filePath);
});

ipcMain.on(IPC_MAIN_CHANNELS.STOP_WATCHER, async () => {
  await stopWatchFiles();
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

// Suppress popups during E2E tests
if (process.env.E2E_TEST === 'true') {
  store.set('sponsorship.lastShown', Date.now());
  const seenVersions = store.get('seenReleaseNotes') ?? [];
  store.set('seenReleaseNotes', [...seenVersions, app.getVersion()]);
}

const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();

  // Electron warns about Chrome extension permissions it doesn't implement
  // (e.g. Redux DevTools' 'contextMenus'). Node prints warnings through a
  // default 'warning' listener, so swap it for one that drops just those.
  const defaultWarningListeners = process.listeners('warning');
  process.removeAllListeners('warning');
  process.on('warning', (warning) => {
    if (warning.name === 'ExtensionLoadWarning') {
      return;
    }
    defaultWarningListeners.forEach((listener) => listener.call(process, warning));
  });
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  // Only extensions relevant to this codebase; electron-devtools-installer@4
  // dropped some previously referenced ones (e.g. APOLLO_DEVELOPER_TOOLS), and
  // Ember Inspector's MV3 background crashes under Electron.
  const {REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS} = installer;
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;

  // electron-devtools-installer@4 still calls the deprecated session.loadExtension
  // and session.getAllExtensions APIs; silence just those deprecation logs.
  const previousNoDeprecation = process.noDeprecation;
  process.noDeprecation = true;
  try {
    return await installer
      .default([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS], {forceDownload})
      .catch((error: unknown) => log.warn('DevTools extension install failed', error));
  } finally {
    process.noDeprecation = previousNoDeprecation;
  }
};

// Session-level wiring runs once, after app ready (the session does not exist
// before that).
const wireSessionOnce = () => {
  // Allow the BrowserSync host (the event-mirroring transport injected into
  // every preview) through page CSPs — every header value, exact directive
  // names only.
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const headers = details.responseHeaders;
    if (headers) {
      const bsHost = getBrowserSyncHost();
      Object.keys(headers)
        .filter((key) => key.toLowerCase() === 'content-security-policy')
        .forEach((key) => {
          headers[key] = headers[key].map((policy) => injectHostIntoCsp(policy, bsHost));
        });
    }
    callback({responseHeaders: headers});
  });

  webPermissionHandlers.init();
};

let appUpdater: AppUpdater | null = null;
let isBrowserSyncInitiated = false;

const createWindow = async () => {
  windowShownOnOpen = false;
  if (process.env.E2E_TEST !== 'true') {
    await installExtensions();
  }

  const isBuiltApp = app.isPackaged || process.env.E2E_TEST === 'true';
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const windowState = getSavedWindowState();

  mainWindow = new BrowserWindow({
    show: false,
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    icon: getAssetPath('icon.png'),
    ...getTitleBarOptions(),
    webPreferences: {
      preload: isBuiltApp
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      webviewTag: true,
    },
  });
  if (windowState.isMaximized) {
    mainWindow.maximize();
  }
  trackWindowState(mainWindow);
  initDevtoolsHandlers(mainWindow);
  wireWebviewSecurity(mainWindow.webContents, {
    openInPreview: (url) => openUrl(url, getMainWindow()),
    openExternal: (url) => shell.openExternal(url),
    onShortcut: (channel) => {
      getMainWindow()?.webContents.send(IPC_MAIN_CHANNELS.SHORTCUT_TRIGGERED, channel);
    },
  });

  mainWindow.loadURL(
    `${resolveHtmlPath('index.html')}${urlToOpen ? `?urlToOpen=${encodeURI(urlToOpen)}` : ''}`
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
    if (!isBrowserSyncInitiated) {
      await initInstance();
      isBrowserSyncInitiated = true;
    }

    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else if (process.env.E2E_TEST === 'true' && process.env.E2E_HEADLESS === 'true') {
      windowShownOnOpen = true;
    } else if (process.env.E2E_TEST === 'true') {
      mainWindow.showInactive();
      windowShownOnOpen = true;
    } else {
      mainWindow.showInactive();
      if (!windowShownOnOpen) {
        windowShownOnOpen = true;
        mainWindow.show();
      } else {
        mainWindow.showInactive();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow, appUpdater!);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return {action: 'deny'};
  });
};

app.on('open-url', async (event, url) => {
  const actualURL = normalizeProtocolUrl(url);
  if (!isOpenableUrl(actualURL)) {
    log.warn('[deep-link] rejected URL', url);
    return;
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
  if (url.indexOf(getBrowserSyncHost()) !== -1) {
    event.preventDefault();
    return callback(true);
  }
  log.info('certificate-error event', url, getBrowserSyncHost());
  return callback(store.get('userPreferences.allowInsecureSSLConnections'));
});

app
  .whenReady()
  .then(() => {
    wireSessionOnce();
    appUpdater = new AppUpdater();
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch((error) => log.error('Failed to start app', error));
