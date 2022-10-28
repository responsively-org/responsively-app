import { ipcMain, webContents } from 'electron';

export interface DisableDefaultWindowOpenHandlerArgs {
  webContentsId: number;
}

export interface DisableDefaultWindowOpenHandlerResult {
  done: boolean;
}

export const initNativeFunctionHandlers = () => {
  ipcMain.handle(
    'disable-default-window-open-handler',
    async (
      _,
      arg: DisableDefaultWindowOpenHandlerArgs
    ): Promise<DisableDefaultWindowOpenHandlerResult> => {
      webContents.fromId(arg.webContentsId).setWindowOpenHandler((edata) => {
        console.log('window open handler', edata);
        return { action: 'deny' };
      });
      return { done: true };
    }
  );
};
