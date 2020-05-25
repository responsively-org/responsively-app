// @flow
import {app, dialog, Menu, shell, BrowserWindow} from 'electron';

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
          shell.openExternal(
            'https://manojvivek.github.io/responsively-app/'
          );
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
          shell.openExternal('https://github.com/manojVivek/responsively-app/issues');
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
            filters: [
              { name: 'HTML', extensions: ['htm', 'html'] },
            ]
          });
          if (!selected || !selected.length) {
            return;
          }
          this.mainWindow.webContents.send('address-change', selected[0]);
        },
      }
    ]
  }

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
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
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

    return [subMenuAbout, this.subMenuFile, subMenuEdit, subMenuView, subMenuWindow, this.subMenuHelp];
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
                  label: '&ReloadCSS',
                  accelerator: 'Alt+R',
                  click: () => {
                    this.mainWindow.webContents.send('reload-css');
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
      this.subMenuHelp
    ];

    return templateDefault;
  }
}
