import {ClearStorageDataOptions, ipcMain, webContents} from 'electron';
import {IPC_MAIN_CHANNELS} from '../../common/constants';
import {isRegisteredWebview} from '../webview-registry';

export interface DeleteStorageArgs {
  webContentsId: number;
  storages?: string[];
}

export interface DeleteStorageResult {
  done: boolean;
}

const deleteStorage = async (arg: DeleteStorageArgs): Promise<DeleteStorageResult> => {
  const {webContentsId, storages} = arg;
  if (!isRegisteredWebview(webContentsId)) {
    return {done: false};
  }
  if (storages?.length === 1 && storages[0] === 'network-cache') {
    await webContents.fromId(webContentsId)?.session.clearCache();
  } else {
    await webContents
      .fromId(webContentsId)
      ?.session.clearStorageData({storages} as ClearStorageDataOptions);
  }
  return {done: true};
};

export const initWebviewStorageManagerHandlers = () => {
  ipcMain.handle(
    IPC_MAIN_CHANNELS.DELETE_STORAGE,
    async (_, arg: DeleteStorageArgs): Promise<DeleteStorageResult> => {
      return deleteStorage(arg);
    }
  );
};
