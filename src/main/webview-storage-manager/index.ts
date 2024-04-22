import { ClearStorageDataOptions, ipcMain, webContents } from 'electron';

export interface DeleteStorageArgs {
  webContentsId: number;
  storages?: string[];
}

export interface DeleteStorageResult {
  done: boolean;
}

const deleteStorage = async (
  arg: DeleteStorageArgs
): Promise<DeleteStorageResult> => {
  const { webContentsId, storages } = arg;
  if (storages?.length === 1 && storages[0] === 'network-cache') {
    await webContents.fromId(webContentsId)?.session.clearCache();
  } else {
    await webContents
      .fromId(webContentsId)
      ?.session.clearStorageData({ storages } as ClearStorageDataOptions);
  }
  return { done: true };
};

export const initWebviewStorageManagerHandlers = () => {
  ipcMain.handle(
    'delete-storage',
    async (_, arg: DeleteStorageArgs): Promise<DeleteStorageResult> => {
      return deleteStorage(arg);
    }
  );
};
