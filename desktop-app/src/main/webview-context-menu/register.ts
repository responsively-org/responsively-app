import { BrowserWindow, ipcMain, Menu } from 'electron';
import { CONTEXT_MENUS } from './common';

export const initWebviewContextMenu = () => {
  ipcMain.removeAllListeners('show-context-menu');
  ipcMain.on('show-context-menu', (event, ...args) => {
    const template: Electron.MenuItemConstructorOptions[] = Object.values(
      CONTEXT_MENUS
    ).map((menu) => {
      return {
        label: menu.label,
        click: () => {
          event.sender.send('context-menu-command', {
            command: menu.id,
            arg: args[0],
          });
        },
      };
    });
    const menu = Menu.buildFromTemplate(template);
    menu.popup(
      BrowserWindow.fromWebContents(event.sender) as Electron.PopupOptions
    );
  });
};

export default initWebviewContextMenu;
