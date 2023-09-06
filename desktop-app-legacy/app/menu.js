// @flow
import {
  app,
  dialog,
  Menu,
  shell,
  BrowserWindow,
  clipboard,
  screen,
} from 'electron';
import fs from 'fs';
import url from 'url';
import {getEnvironmentInfo, getPackageJson} from './utils/generalUtils';
import {
  getAllShortcuts,
  registerShortcut,
} from './shortcut-manager/main-shortcut-manager';
import {appUpdater, AppUpdaterStatus} from './app-updater';
import {statusBarSettings} from './settings/statusBarSettings';
import {STATUS_BAR_VISIBILITY_CHANGE} from './constants/pubsubEvents';
import {userPreferenceSettings} from './settings/userPreferenceSettings';

const path = require('path');

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  aboutClick() {
    const iconPath = path.join(__dirname, '../resources/icons/64x64.png');
    const title = 'Responsively';
    const {description} = getPackageJson();
    const {
      appVersion,
      electronVersion,
      chromeVersion,
      nodeVersion,
      v8Version,
      osInfo,
    } = getEnvironmentInfo();

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
      .showMessageBox(BrowserWindow.getAllWindows()[0], {
        type: 'none',
        buttons,
        title,
        message: title,
        detail,
        noLink: true,
        icon: iconPath,
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
            parent: BrowserWindow.getFocusedWindow(),
            frame: false,
            webPreferences: {
              devTools: false,
              nodeIntegration: true,
              additionalArguments: [JSON.stringify(getAllShortcuts())],
            },
          });

          const currentScreen = getDisplayNearestPoint(getCursorScreenPoint());
          win.setPosition(currentScreen.workArea.x, currentScreen.workArea.y);

          win.center();

          win.loadURL(
            url.format({
              protocol: 'file',
              pathname: path.join(__dirname, 'shortcuts.html'),
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
          appUpdater.checkForUpdatesAndNotify().then(r => {
            if (
              r == null ||
              r.updateInfo == null ||
              r.updateInfo.version === getPackageJson().version
            ) {
              dialog.showMessageBox(BrowserWindow.getAllWindows()[0], {
                type: 'info',
                title: 'Responsively',
                message: 'The app is up to date! 🎉',
              });
            }
          });
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'About',
        accelerator: 'F1',
        click: this.aboutClick,
        shortcutIndex: 5,
      },
    ],
  };

  subMenuFile = {
    label: 'File',
    submenu: [
      {
        label: 'Open HTML file',
        accelerator: 'CommandOrControl+O',
        shortcutIndex: 0,
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

  getCheckForUpdatesMenuState() {
    const updaterStatus = appUpdater.getCurrentStatus();
    let label = 'Check for Updates...';
    let enabled = true;

    switch (updaterStatus) {
      case AppUpdaterStatus.Idle:
        label = 'Check for Updates...';
        enabled = true;
        break;
      case AppUpdaterStatus.Checking:
        label = 'Checking for Updates...';
        enabled = false;
        break;
      case AppUpdaterStatus.NoUpdate:
        label = 'No Updates';
        enabled = false;
        break;
      case AppUpdaterStatus.Downloading:
        label = 'Downloading Update...';
        enabled = false;
        break;
      case AppUpdaterStatus.NewVersion:
        label = 'New version available';
        enabled = false;
        break;
      case AppUpdaterStatus.Downloaded:
        label = 'Update Downloaded';
        enabled = false;
        break;
      default:
        break;
    }

    return {label, enabled};
  }

  buildMenu(isUpdate: boolean = false) {
    if (isUpdate) {
      const chkUpdtMenu = this.subMenuHelp.submenu.find(
        x => x.id === 'CHECK_FOR_UPDATES'
      );
      const {label, enabled} = this.getCheckForUpdatesMenuState();
      chkUpdtMenu.label = label;
      chkUpdtMenu.enabled = enabled;
    }

    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    if (!isUpdate) {
      this.registerMenuShortcuts(template);
    }
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
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

  buildDarwinTemplate() {
    const subMenuAbout = {
      label: 'Responsively',
      submenu: [
        {
          label: 'About ResponsivelyApp',
          selector: 'orderFrontStandardAboutPanel:',
          click: this.aboutClick,
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
          skipRegistration: true,
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: 'Reload Ignoring Cache',
          accelerator: 'CommandOrControl+Shift+R',
          shortcutIndex: 3,
          click: () => {
            this.mainWindow.webContents.send('reload-url', {ignoreCache: true});
          },
        },
        {
          label: '&ReloadCSS',
          accelerator: 'Alt+R',
          shortcutIndex: 2,
          click: () => {
            this.mainWindow.webContents.send('reload-css');
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          shortcutIndex: 4,
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
          click: () => {
            this.mainWindow.webContents.send(STATUS_BAR_VISIBILITY_CHANGE);
          },
        },
      ],
    };
    const subMenuViewProd = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CommandOrControl+R',
          skipRegistration: true,
          click: () => {
            this.mainWindow.webContents.send('reload-url');
          },
        },
        {
          label: 'Reload Ignoring Cache',
          accelerator: 'CommandOrControl+Shift+R',
          shortcutIndex: 3,
          click: () => {
            this.mainWindow.webContents.send('reload-url', {ignoreCache: true});
          },
        },
        {
          label: '&ReloadCSS',
          accelerator: 'Alt+R',
          shortcutIndex: 2,
          click: () => {
            this.mainWindow.webContents.send('reload-css');
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          shortcutIndex: 4,
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Show Status Bar',
          type: 'checkbox',
          checked: statusBarSettings.getVisibility(),
          click: () => {
            this.mainWindow.webContents.send(STATUS_BAR_VISIBILITY_CHANGE);
          },
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

  buildDefaultTemplate() {
    const templateDefault = [
      this.subMenuFile,
      {
        label: '&View',
        submenu:
          process.env.NODE_ENV === 'development'
            ? [
                {
                  label: '&Reload',
                  accelerator: 'CommandOrControl+R',
                  skipRegistration: true,
                  click: () => {
                    this.mainWindow.webContents.reload();
                  },
                },
                {
                  label: 'Reload Ignoring Cache',
                  accelerator: 'CommandOrControl+Shift+R',
                  shortcutIndex: 3,
                  click: () => {
                    this.mainWindow.webContents.send('reload-url', {
                      ignoreCache: true,
                    });
                  },
                },
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  shortcutIndex: 4,
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
                  click: () => {
                    this.mainWindow.webContents.send(
                      STATUS_BAR_VISIBILITY_CHANGE
                    );
                  },
                },
              ]
            : [
                {
                  label: '&Reload',
                  accelerator: 'CommandOrControl+R',
                  skipRegistration: true,
                  click: () => {
                    this.mainWindow.webContents.send('reload-url');
                  },
                },
                {
                  label: '&ReloadCSS',
                  accelerator: 'Alt+R',
                  shortcutIndex: 2,
                  click: () => {
                    this.mainWindow.webContents.send('reload-css');
                  },
                },
                {
                  label: 'Reload Ignoring Cache',
                  accelerator: 'CommandOrControl+Shift+R',
                  shortcutIndex: 3,
                  click: () => {
                    this.mainWindow.webContents.send('reload-url', {
                      ignoreCache: true,
                    });
                  },
                },
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  shortcutIndex: 4,
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
                  click: () => {
                    this.mainWindow.webContents.send(
                      STATUS_BAR_VISIBILITY_CHANGE
                    );
                  },
                },
              ],
      },
      this.subMenuHelp,
    ];

    return templateDefault;
  }

  registerMenuShortcuts(
    template: Array<MenuItemConstructorOptions | MenuItem>,
    id: string = 'Menu'
  ) {
    if ((template || []).length === 0) return;

    for (let i = 0; i < template.length; i++) {
      const item = template[i];
      if (item == null || item.skipRegistration) continue;

      const label = (item.label || `submenu${i}`).split('&').join('');
      const levelId = `${id}_${label}`;

      if (item.accelerator != null)
        registerShortcut({
          id: levelId,
          title: label,
          accelerators: [item.accelerator],
          index: item.shortcutIndex,
        });

      if (item.submenu == null) continue;

      if (Array.isArray(item.submenu))
        this.registerMenuShortcuts(item.submenu, levelId);
      else this.registerMenuShortcuts([item.submenu], levelId);
    }
  }
}
