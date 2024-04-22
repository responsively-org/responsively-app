import { BrowserWindow } from 'electron';
import { IPC_MAIN_CHANNELS } from '../../common/constants';

// eslint-disable-next-line import/prefer-default-export
export const openUrl = (url: string, mainWindow: BrowserWindow | null) => {
  mainWindow?.webContents.send(IPC_MAIN_CHANNELS.OPEN_URL, {
    url,
  });
};
