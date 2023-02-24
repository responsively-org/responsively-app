import {
  BrowserWindow,
  clipboard,
  dialog,
  MenuItemConstructorOptions,
  shell,
} from 'electron';
import path from 'path';

import { getEnvironmentInfo, getPackageJson } from '../util';

const aboutOnClick = () => {
  const iconPath = path.join(__dirname, '../resources/icons/64x64.png');
  const title = 'Responsively';
  const { description } = getPackageJson();
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
    .then(({ response }) => {
      if (response === defaultId) {
        clipboard.writeText(usefulInfo, 'clipboard');
      }
      return null;
    })
    .catch((err) => {
      console.error('Error opening about', err);
    });
};

export const subMenuHelp: MenuItemConstructorOptions = {
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
      type: 'separator',
    },
    {
      label: 'About',
      accelerator: 'F1',
      click: aboutOnClick,
    },
  ],
};
