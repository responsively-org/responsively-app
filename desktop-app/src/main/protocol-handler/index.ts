import {BrowserWindow} from 'electron';
import {IPC_MAIN_CHANNELS} from '../../common/constants';

export const openUrl = (url: string, mainWindow: BrowserWindow | null) => {
  mainWindow?.webContents.send(IPC_MAIN_CHANNELS.OPEN_URL, {
    url,
  });
};
