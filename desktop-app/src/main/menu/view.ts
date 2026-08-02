import {BrowserWindow, MenuItemConstructorOptions} from 'electron';

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const getToggleFullScreen = (mainWindow: BrowserWindow): MenuItemConstructorOptions => ({
  label: 'Toggle &Full Screen',
  accelerator: isMac ? 'Ctrl+CommandOrControl+F' : 'F11',
  click: () => {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  },
});

const getToggleDevTools = (mainWindow: BrowserWindow): MenuItemConstructorOptions => ({
  label: 'Toggle &Developer Tools',
  accelerator: isMac ? 'Alt+CommandOrControl+I' : 'Alt+Ctrl+I',
  click: () => {
    mainWindow.webContents.toggleDevTools();
  },
});

const getReloadMenu = (mainWindow: BrowserWindow): MenuItemConstructorOptions => ({
  label: '&Reload',
  accelerator: 'CommandOrControl+R',
  click: () => {
    if (isDev) {
      mainWindow.webContents.reload();
      return;
    }
    mainWindow.webContents.send('reload', {});
  },
});

const getReloadIgnoringCacheMenu = (mainWindow: BrowserWindow): MenuItemConstructorOptions => ({
  label: 'Reload Ignoring Cache',
  accelerator: 'CommandOrControl+Shift+R',
  click: () => {
    mainWindow.webContents.send('reload', {ignoreCache: true});
  },
});

const getFindMenu = (mainWindow: BrowserWindow): MenuItemConstructorOptions => ({
  label: '&Find',
  accelerator: 'CommandOrControl+F',
  click: () => {
    mainWindow.webContents.send('toggle-find-bar');
  },
});

const getViewMenuProd = (mainWindow: BrowserWindow): MenuItemConstructorOptions => ({
  label: '&View',
  submenu: [
    getReloadMenu(mainWindow),
    getReloadIgnoringCacheMenu(mainWindow),
    getFindMenu(mainWindow),
    getToggleFullScreen(mainWindow),
  ],
});

const getViewMenuDev = (mainWindow: BrowserWindow): MenuItemConstructorOptions => ({
  label: '&View',
  submenu: [
    getReloadMenu(mainWindow),
    getToggleDevTools(mainWindow),
    getFindMenu(mainWindow),
    getToggleFullScreen(mainWindow),
  ],
});

export const getViewMenu = isDev ? getViewMenuDev : getViewMenuProd;
