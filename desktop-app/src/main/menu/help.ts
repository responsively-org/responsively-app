import {
  BrowserWindow,
  MenuItemConstructorOptions,
  ipcMain,
  shell,
} from 'electron';

import { EnvironmentInfo, getEnvironmentInfo } from '../util';
import { IPC_MAIN_CHANNELS } from '../../common/constants';
import { AppUpdater, AppUpdaterStatus } from '../app-updater';

export interface AboutDialogArgs {
  environmentInfo: EnvironmentInfo;
  updaterStatus: AppUpdaterStatus;
}

export const subMenuHelp = (
  mainWindow: BrowserWindow,
  appUpdater: AppUpdater
): MenuItemConstructorOptions => {
  const environmentInfo = getEnvironmentInfo();
  ipcMain.handle('get-about-info', async (_): Promise<AboutDialogArgs> => {
    return {
      environmentInfo,
      updaterStatus: appUpdater.getStatus(),
    };
  });

  return {
    label: 'Help',
    submenu: [
      {
        label: 'Learn More',
        click() {
          shell.openExternal('https://responsively.app');
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
        label: 'Join Discord',
        click() {
          shell.openExternal('https://responsively.app/join-discord/');
        },
      },
      {
        label: 'Search Issues',
        click() {
          shell.openExternal(
            'https://github.com/responsively-org/responsively-app/issues'
          );
        },
      },
      {
        label: 'Sponsor Responsively',
        click() {
          shell.openExternal(
            'https://responsively.app/sponsor?utm_source=app&utm_medium=menu&utm_campaign=sponsor'
          );
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'About',
        accelerator: 'F1',
        click: () => {
          mainWindow.webContents.send(IPC_MAIN_CHANNELS.OPEN_ABOUT_DIALOG, {
            environmentInfo,
            updaterStatus: appUpdater.getStatus(),
          });
        },
      },
    ],
  };
};
