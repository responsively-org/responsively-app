import { BrowserWindow, ipcMain, Menu } from 'electron';

export const initWebviewContextMenu = () => {
  ipcMain.on('show-context-menu', (event) => {
    console.log('show context menu');
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'Open Console',
        click: () => {
          event.sender.send('context-menu-command', 'open-console');
        },
      },
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup(
      BrowserWindow.fromWebContents(event.sender) as Electron.PopupOptions
    );
  });
};

export default initWebviewContextMenu;
