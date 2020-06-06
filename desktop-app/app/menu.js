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
import * as os from 'os';
import {pkg} from './utils/generalUtils';
import {getAllShortcuts} from './shotcut-manager/main-shortcut-manager';

const path = require('path');

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  subMenuHelp = {
    label: 'Help',
    submenu: [
      {
        label: 'Website',
        click() {
          shell.openExternal('https://manojvivek.github.io/responsively-app/');
        },
      },
      {
        label: 'Open Source',
        click() {
          shell.openExternal('https://github.com/manojVivek/responsively-app');
        },
      },
      {
        label: 'Report Issues',
        click() {
          shell.openExternal(
            'https://github.com/manojVivek/responsively-app/issues'
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
        label: 'Keyboard Shortcuts',
        click: () => {
          const {getCursorScreenPoint, getDisplayNearestPoint} = screen;

          let win = new BrowserWindow({
            parent: BrowserWindow.getFocusedWindow(),
            frame: false,
            webPreferences: {
              devTools: false,
              nodeIntegration: true,
              additionalArguments: [JSON.stringify(getAllShortcuts())]
            },
          });

          const currentScreen = getDisplayNearestPoint(getCursorScreenPoint());
          win.setPosition(currentScreen.workArea.x, currentScreen.workArea.y);

          win.center();

          win.loadURL(`file://${__dirname}/shortcuts.html`);

          win.once('ready-to-show', () => {
            win.show();
          });

          win.on('blur', () => {
            win.hide();
          });

          win.on('closed', () => {
            win = null;
          });
        },
      },
      {
        label: 'About',
        click() {
          const iconPath = path.join(__dirname, '../resources/icons/64x64.png');
          const title = 'Responsively';
          const description = pkg.description;
          const version = pkg.version || 'Unknown';
          const electron = process.versions['electron'] || 'Unknown';
          const chrome = process.versions['chrome'] || 'Unknown';
          const node = process.versions['node'] || 'Unknown';
          const v8 = process.versions['v8'] || 'Unknown';
          const osText =
            `${os.type()} ${os.arch()} ${os.release()}`.trim() || 'Unknown';
          const usefulInfo = `Version: ${version}\nElectron: ${electron}\nChrome: ${chrome}\nNode.js: ${node}\nV8: ${v8}\nOS: ${osText}`;
          const detail = description
            ? `${description}\n\n${usefulInfo}`
            : usefulInfo;
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
        },
      },
    ],
  };

  subMenuFile = {
    label: 'File',
    submenu: [
      {
        label: 'Open HTML file',
        accelerator: 'Command+O',
        click: () => {
          const selected = dialog.showOpenDialogSync({
            filters: [{name: 'HTML', extensions: ['htm', 'html']}],
          });
          if (!selected || !selected.length || !selected[0]) {
            return;
          }
          let filePath = selected[0];
          if (!filePath.startsWith('file://')) {
            filePath = 'file://' + filePath;
          }
          this.mainWindow.webContents.send('address-change', filePath);
        },
      },
    ],
  };

  buildMenu() {
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
        },
        {type: 'separator'},
        {label: 'Services', submenu: []},
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
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.toggleDevTools();
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
              ],
      },
      this.subMenuHelp,
    ];

    return templateDefault;
  }
}
