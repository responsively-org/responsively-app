import { AuthInfo, app, BrowserWindow, ipcMain } from 'electron';
import { IPC_MAIN_CHANNELS } from '../../common/constants';

export type AuthRequestArgs = AuthInfo;

export interface AuthResponseArgs {
  username: string;
  password: string;
  authInfo: AuthInfo;
}

type Callback = (username: string, password: string) => void;

const inProgressAuthentications: { [key: string]: Callback[] } = {};

const handleLogin = async (
  authInfo: AuthInfo,
  mainWindow: BrowserWindow,
  callback: (username: string, password: string) => void
) => {
  if (inProgressAuthentications[authInfo.host]) {
    inProgressAuthentications[authInfo.host].push(callback);
    return;
  }
  inProgressAuthentications[authInfo.host] = [callback];

  mainWindow.webContents.send(IPC_MAIN_CHANNELS.AUTH_REQUEST, authInfo);
  ipcMain.once(
    IPC_MAIN_CHANNELS.AUTH_RESPONSE,
    (_, { authInfo: respAuthInfo, username, password }: AuthResponseArgs) => {
      inProgressAuthentications[respAuthInfo.host].forEach((cb) =>
        cb(username, password)
      );
      delete inProgressAuthentications[respAuthInfo.host];
    }
  );
};

export const initHttpBasicAuthHandlers = (mainWindow: BrowserWindow) => {
  app.on('login', (event, _webContents, _request, authInfo, callback) => {
    event.preventDefault();
    handleLogin(authInfo, mainWindow, callback);
  });
};
