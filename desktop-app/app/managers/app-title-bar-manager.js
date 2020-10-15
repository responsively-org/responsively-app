import {DARK_THEME} from '../constants/theme';
import {Titlebar, Color} from 'custom-electron-titlebar';
import fs from 'fs';
import url from 'url';
import {
  getEnvironmentInfo,
  getPackageJson,
  getAppPath,
} from '../utils/generalUtils';
import {ShortcutManager} from './shortcut-manager';
import {statusBarSettings} from '../settings/statusBarSettings';
import {STATUS_BAR_VISIBILITY_CHANGE} from '../constants/pubsubEvents';
import {APP_UPDATER_STATUS} from '../constants/app-updater-status';
import {userPreferenceSettings} from '../settings/userPreferenceSettings';
import {remote, ipcRenderer, nativeImage} from 'electron';
import {set} from 'core-js/fn/dict';
import logo32 from '../../resources/icons/32x32.png';

const {app, dialog, Menu, shell, BrowserWindow, clipboard, screen} = remote;
const path = require('path');

class AppTitleBarManager {
  titleBar: Titlebar = null;
  mainWindow: BrowserWindow;
  currentTheme: string;

  constructor() {
    this.mainWindow = BrowserWindow.getAllWindows()[0];
    ipcRenderer.on('updater-status-changed', (event, args) => {
      if (this.titleBar != null)
        this.titleBar.updateMenu(this._buildMenu(true, args.nextStatus));
    });
  }

  _getColorFromTheme(theme) {
    return Color.fromHex(theme === DARK_THEME ? '#313131' : '#ECECEC');
  }

  initTitleBar(theme) {
    if (this.titleBar == null) {
      this.currentTheme = theme;
      this.titleBar = new Titlebar({
        backgroundColor: this._getColorFromTheme(theme),
        icon: logo32,
        menu: this._buildMenu(),
      });
    }
  }

  refreshMenu() {
    if (this.titleBar == null) this.initTitleBar(theme);
    else this.titleBar.updateMenu(this._buildMenu());
  }

  updateBackground(theme) {
    this.currentTheme = theme;
    if (this.titleBar == null) this.initTitleBar(theme);
    else this.titleBar.updateBackground(this._getColorFromTheme(theme));
  }

  dispose() {
    if (this.titleBar != null) {
      this.titleBar.dispose();
      this.titleBar = null;
    }
  }

  _toggleStatusBarClick() {
    this.mainWindow.webContents.send(STATUS_BAR_VISIBILITY_CHANGE);
    setTimeout(() => {
      this.refreshMenu();
    }, 100);
  }

  _aboutClick() {
    const title = 'Responsively';
    const {description} = getPackageJson(false);
    const {
      appVersion,
      electronVersion,
      chromeVersion,
      nodeVersion,
      v8Version,
      osInfo,
    } = getEnvironmentInfo(false);

    const usefulInfo = `Version: ${appVersion}\nElectron: ${electronVersion}\nChrome: ${chromeVersion}\nNode.js: ${nodeVersion}\nV8: ${v8Version}\nOS: ${osInfo}`;
    const detail = description ? `${description}\n\n${usefulInfo}` : usefulInfo;
    let buttons = ['OK', 'Copy'];
    let cancelId = 0;
    let defaultId = 1;
    if (process.platform === 'linux') {
      buttons = ['Copy', 'OK'];
      cancelId = 1;
      defaultId = 0;
    }
    dialog
      .showMessageBox(this.mainWindow, {
        type: 'none',
        buttons,
        title,
        message: title,
        detail,
        noLink: true,
        icon: path.resolve(getAppPath(false), './resources/icons/64x64.png'),
        cancelId,
        defaultId,
      })
      .then(({response}) => {
        if (response === defaultId) {
          clipboard.writeText(usefulInfo, 'clipboard');
        }
      });
  }

  subMenuHelp = {
    label: 'Help',
    submenu: [
      {
        label: 'Website',
        click() {
          shell.openExternal('https://responsively.app/');
        },
      },
      {
        label: 'Open Source',
        click() {
          shell.openExternal(
            'https://github.com/responsively-org/responsively-app'
          );
        },
      },
      {
        label: 'Report Issues',
        click() {
          shell.openExternal(
            'https://github.com/responsively-org/responsively-app/issues'
          );
        },
      },
      {
        label: 'Find on ProductHunt',
        click() {
          shell.openExternal('https://www.producthunt.com/posts/responsively');
        },
      },
      {
        label: 'Follow on Twitter',
        click() {
          shell.openExternal(
            'https://twitter.com/intent/follow?original_referer=app&ref_src=twsrc%5Etfw&region=follow_link&screen_name=ResponsivelyApp&tw_p=followbutton'
          );
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Keyboard Shortcuts',
        click: () => {
          const {getCursorScreenPoint, getDisplayNearestPoint} = screen;

          let win = new BrowserWindow({
            parent: this.mainWindow,
            frame: false,
            show: false,
            webPreferences: {
              devTools: false,
              nodeIntegration: true,
              additionalArguments: [
                JSON.stringify(ShortcutManager.getAllShortcuts()),
                path.resolve(
                  getAppPath(false),
                  `./app/shortcuts-${this.currentTheme}.css`
                ),
              ],
            },
          });

          const currentScreen = getDisplayNearestPoint(getCursorScreenPoint());
          win.setPosition(currentScreen.workArea.x, currentScreen.workArea.y);

          win.center();

          win.loadURL(
            url.format({
              protocol: 'file',
              pathname: path.resolve(getAppPath(false), './app/shortcuts.html'),
            })
          );

          win.once('ready-to-show', () => {
            win.show();
          });

          win.on('blur', () => {
            win.close();
          });

          win.on('closed', () => {
            win = null;
          });
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Check for Updates...',
        id: 'CHECK_FOR_UPDATES',
        click() {
          ipcRenderer.send('check-for-updates');
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'About',
        accelerator: 'F1',
        click: this._aboutClick,
      },
    ],
  };

  subMenuFile = {
    label: 'File',
    submenu: [
      {
        label: 'Open HTML file',
        accelerator: 'CommandOrControl+O',
        click: () => {
          const selected = dialog.showOpenDialogSync({
            filters: [{name: 'HTML', extensions: ['htm', 'html']}],
          });

          if (!selected || !selected.length || !selected[0]) {
            return;
          }
          let filePath = selected[0];

          filePath = url.format({
            protocol: 'file',
            pathname: filePath,
          });
          this.mainWindow.webContents.send('address-change', filePath);
        },
      },
      {
        label: 'Open Screenshots folder',
        click: () => {
          try {
            const userSelectedScreenShotSavePath = userPreferenceSettings.getScreenShotSavePath();
            const dir =
              userSelectedScreenShotSavePath ||
              userPreferenceSettings.getDefaultScreenshotpath();
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir);
            }
            shell.openPath(dir);
          } catch (err) {
            console.log('Error opening screenshots folder', err);
          }
        },
      },
      {
        type: 'separator',
      },
      {
        role: process.platform === 'darwin' ? 'close' : 'quit',
      },
    ],
  };

  _getCheckForUpdatesMenuState(statusId) {
    let label = APP_UPDATER_STATUS.Idle.title;
    let enabled = APP_UPDATER_STATUS.Idle.enabled;

    if (statusId in APP_UPDATER_STATUS) {
      label = APP_UPDATER_STATUS[statusId].title;
      enabled = APP_UPDATER_STATUS[statusId].enabled;
    }

    return {label, enabled};
  }

  _buildMenu(isUpdate: boolean = false, nextStatus: string = null) {
    if (isUpdate && nextStatus) {
      const chkUpdtMenu = this.subMenuHelp.submenu.find(
        x => x.id === 'CHECK_FOR_UPDATES'
      );
      const {label, enabled} = this._getCheckForUpdatesMenuState(nextStatus);
      chkUpdtMenu.label = label;
      chkUpdtMenu.enabled = enabled;
    }

    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this._setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this._buildDarwinTemplate()
        : this._buildDefaultTemplate();

    if (!isUpdate) {
      this._registerMenuShortcuts(template);
    }
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    return menu;
  }

  _setupDevelopmentEnvironment() {
    this.mainWindow.openDevTools();
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const {x, y} = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.inspectElement(x, y);
          },
        },
      ]).popup(this.mainWindow);
    });
  }

  _buildDarwinTemplate() {
    const subMenuAbout = {
      label: 'Responsively',
      submenu: [
        {
          label: 'About ResponsivelyApp',
          selector: 'orderFrontStandardAboutPanel:',
          click: this._aboutClick,
        },
        {type: 'separator'},
        // {label: 'Services', submenu: []},
        {type: 'separator'},
        {
          label: 'Hide ResponsivelyApp',
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        {label: 'Show All', selector: 'unhideAllApplications:'},
        {type: 'separator'},
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuEdit = {
      label: 'Edit',
      submenu: [
        {label: 'Undo', accelerator: 'Command+Z', selector: 'undo:'},
        {
          label: 'Redo',
          accelerator: 'Shift+Command+Z',
          selector: 'redo:',
        },
        {type: 'separator'},
        {label: 'Cut', accelerator: 'Command+X', selector: 'cut:'},
        {label: 'Copy', accelerator: 'Command+C', selector: 'copy:'},
        {label: 'Paste', accelerator: 'Command+V', selector: 'paste:'},
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:',
        },
      ],
    };
    const subMenuViewDev = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CommandOrControl+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: 'Reload Ignoring Cache',
          accelerator: 'CommandOrControl+Shift+R',
          click: () => {
            this.mainWindow.webContents.send('reload-url', {ignoreCache: true});
          },
        },
        {
          label: '&ReloadCSS',
          accelerator: 'Alt+R',
          click: () => {
            this.mainWindow.webContents.send('reload-css');
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Command+Shift+I',
          click: () => {
            this.mainWindow.toggleDevTools();
          },
        },
        {
          label: 'Show Status Bar',
          type: 'checkbox',
          checked: statusBarSettings.getVisibility(),
          click: () => this._toggleStatusBarClick(),
        },
      ],
    };
    const subMenuViewProd = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CommandOrControl+R',
          click: () => {
            this.mainWindow.webContents.send('reload-url');
          },
        },
        {
          label: 'Reload Ignoring Cache',
          accelerator: 'CommandOrControl+Shift+R',
          click: () => {
            this.mainWindow.webContents.send('reload-url', {ignoreCache: true});
          },
        },
        {
          label: '&ReloadCSS',
          accelerator: 'Alt+R',
          click: () => {
            this.mainWindow.webContents.send('reload-css');
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Show Status Bar',
          type: 'checkbox',
          checked: statusBarSettings.getVisibility(),
          click: () => this._toggleStatusBarClick(),
        },
      ],
    };
    const subMenuWindow = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        {
          label: 'Close',
          accelerator: 'Command+W',
          selector: 'performClose:',
        },
        {type: 'separator'},
        {label: 'Bring All to Front', selector: 'arrangeInFront:'},
      ],
    };

    const subMenuView =
      process.env.NODE_ENV === 'development' ? subMenuViewDev : subMenuViewProd;

    return [
      subMenuAbout,
      this.subMenuFile,
      subMenuEdit,
      subMenuView,
      subMenuWindow,
      this.subMenuHelp,
    ];
  }

  _buildDefaultTemplate() {
    const templateDefault = [
      this.subMenuFile,
      {
        label: '&View',
        submenu:
          process.env.NODE_ENV === 'development'
            ? [
                {
                  label: '&Reload',
                  accelerator: 'Ctrl+R',
                  click: () => {
                    this.mainWindow.webContents.reload();
                  },
                },
                {
                  label: 'Reload Ignoring Cache',
                  accelerator: 'CommandOrControl+Shift+R',
                  click: () => {
                    this.mainWindow.webContents.send('reload-url', {
                      ignoreCache: true,
                    });
                  },
                },
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  },
                },
                {
                  label: 'Toggle &Developer Tools',
                  accelerator: 'Alt+Ctrl+I',
                  click: () => {
                    this.mainWindow.toggleDevTools();
                  },
                },
                {
                  label: 'Show Status Bar',
                  type: 'checkbox',
                  checked: statusBarSettings.getVisibility(),
                  click: () => this._toggleStatusBarClick(),
                },
              ]
            : [
                {
                  label: '&Reload',
                  accelerator: 'CommandOrControl+R',
                  click: () => {
                    this.mainWindow.webContents.send('reload-url');
                  },
                },
                {
                  label: '&ReloadCSS',
                  accelerator: 'Alt+R',
                  click: () => {
                    this.mainWindow.webContents.send('reload-css');
                  },
                },
                {
                  label: 'Reload Ignoring Cache',
                  accelerator: 'CommandOrControl+Shift+R',
                  click: () => {
                    this.mainWindow.webContents.send('reload-url', {
                      ignoreCache: true,
                    });
                  },
                },
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  },
                },
                {
                  label: 'Show Status Bar',
                  type: 'checkbox',
                  checked: statusBarSettings.getVisibility(),
                  click: () => this._toggleStatusBarClick(),
                },
              ],
      },
      this.subMenuHelp,
    ];

    return templateDefault;
  }

  _registerMenuShortcuts(
    template: Array<MenuItemConstructorOptions | MenuItem>,
    id: string = 'Menu'
  ) {
    if ((template || []).length === 0) return;

    for (let i = 0; i < template.length; i++) {
      const item = template[i];
      if (item == null) continue;

      const label = (item.label || `submenu${i}`).split('&').join('');
      const levelId = `${id}_${label}`;

      if (item.accelerator != null)
        ShortcutManager.registerShortcut({
          id: levelId,
          title: label,
          accelerators: [item.accelerator],
        });

      if (item.submenu == null) continue;

      if (Array.isArray(item.submenu))
        this._registerMenuShortcuts(item.submenu, levelId);
      else this._registerMenuShortcuts([item.submenu], levelId);
    }
  }
}

const instance = new AppTitleBarManager();
export {instance as AppTitleBarManager};
