import { clipboard, ipcMain, nativeTheme, webContents } from 'electron';

export interface DisableDefaultWindowOpenHandlerArgs {
  webContentsId: number;
}

export interface DisableDefaultWindowOpenHandlerResult {
  done: boolean;
}

export interface SetNativeThemeArgs {
  theme: 'dark' | 'light';
}

export interface SetNativeThemeResult {
  done: boolean;
}

export const initNativeFunctionHandlers = () => {
  ipcMain.handle(
    'disable-default-window-open-handler',
    async (
      _,
      arg: DisableDefaultWindowOpenHandlerArgs
    ): Promise<DisableDefaultWindowOpenHandlerResult> => {
      webContents.fromId(arg.webContentsId)?.setWindowOpenHandler(() => {
        return { action: 'deny' };
      });
      return { done: true };
    }
  );

  ipcMain.handle(
    'set-native-theme',
    async (_, arg: SetNativeThemeArgs): Promise<SetNativeThemeResult> => {
      const { theme } = arg;
      nativeTheme.themeSource = theme;
      return { done: true };
    }
  );

  ipcMain.handle('copy-to-clipboard', async (_, arg: string): Promise<void> => {
    clipboard.writeText(arg);
  });
};
