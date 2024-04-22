import { app, ipcMain, shell } from 'electron';
import path from 'path';
import { IPC_MAIN_CHANNELS } from '../../common/constants';
import store from '../../store';

export interface AppMetaResponse {
  appVersion: string;
  webviewPreloadPath: string;
}

export const initAppMetaHandlers = () => {
  ipcMain.handle(
    IPC_MAIN_CHANNELS.APP_META,
    async (): Promise<AppMetaResponse> => {
      return {
        webviewPreloadPath: app.isPackaged
          ? path.join(__dirname, 'preload-webview.js')
          : path.join(__dirname, '../../../.erb/dll/preload-webview.js'),
        appVersion: app.getVersion(),
      };
    }
  );

  ipcMain.on('electron-store-get', async (event, val) => {
    event.returnValue = store.get(val);
  });
  ipcMain.on('electron-store-set', async (_, key, val) => {
    store.set(key, val);
  });

  ipcMain.on(IPC_MAIN_CHANNELS.OPEN_EXTERNAL, async (_, { url }) => {
    console.log('Opening external url', url);
    shell.openExternal(url);
  });
};
