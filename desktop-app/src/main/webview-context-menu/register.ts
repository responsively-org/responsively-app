import { BrowserWindow, ipcMain, Menu } from 'electron';
import { CONTEXT_MENUS } from './common';
// import { webViewPubSub } from '../../renderer/lib/pubsub';
// import { MOUSE_EVENTS } from '../ruler';

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
  // ipcMain.on('pass-scroll-data', (event, ...args) => {
  //   console.log(args[0].coordinates);
  //   webViewPubSub.publish(MOUSE_EVENTS.SCROLL, [args[0].coordinates]);
  // });
};

export default initWebviewContextMenu;
