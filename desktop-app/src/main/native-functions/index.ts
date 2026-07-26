import {clipboard, ipcMain, nativeTheme, webContents} from 'electron';
import {IPC_MAIN_CHANNELS} from '../../common/constants';
import {isRegisteredWebview} from '../webview-registry';

export interface SetNativeThemeArgs {
  theme: 'dark' | 'light';
}

export interface SetNativeThemeResult {
  done: boolean;
}

export interface LoadURLInWebviewArgs {
  webContentsId: number;
  url: string;
}

export interface LoadURLInWebviewResult {
  done: boolean;
}

export const initNativeFunctionHandlers = () => {
  ipcMain.handle(
    IPC_MAIN_CHANNELS.LOAD_URL_IN_WEBVIEW,
    async (_, arg: LoadURLInWebviewArgs): Promise<LoadURLInWebviewResult> => {
      if (!isRegisteredWebview(arg.webContentsId)) {
        return {done: false};
      }
      const contents = webContents.fromId(arg.webContentsId);
      if (contents === undefined) {
        return {done: false};
      }
      try {
        await contents.loadURL(arg.url);
      } catch {
        // Superseded navigations reject with ERR_ABORTED; real load failures
        // reach the renderer through the webview's did-fail-load event.
      }
      return {done: true};
    }
  );

  ipcMain.handle(
    IPC_MAIN_CHANNELS.SET_NATIVE_THEME,
    async (_, arg: SetNativeThemeArgs): Promise<SetNativeThemeResult> => {
      const {theme} = arg;
      nativeTheme.themeSource = theme;
      return {done: true};
    }
  );

  ipcMain.handle(IPC_MAIN_CHANNELS.COPY_TO_CLIPBOARD, async (_, arg: string): Promise<void> => {
    clipboard.writeText(arg);
  });
};
