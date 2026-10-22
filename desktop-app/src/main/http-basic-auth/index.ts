import {AuthInfo, app, BrowserWindow, ipcMain} from 'electron';
import {IPC_MAIN_CHANNELS} from '../../common/constants';

export type AuthRequestArgs = AuthInfo;

export interface AuthResponseArgs {
  username: string;
  password: string;
  authInfo: AuthInfo;
}

type Callback = (username: string, password: string) => void;

const inProgressAuthentications: {[key: string]: Callback[]} = {};

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
    (_, {authInfo: respAuthInfo, username, password}: AuthResponseArgs) => {
      inProgressAuthentications[respAuthInfo.host].forEach((cb) => cb(username, password));
      delete inProgressAuthentications[respAuthInfo.host];
    }
  );
};

// Wired once per process (not per window) — a getter keeps it working across
// macOS window close/recreate without stacking 'login' listeners.
export const initHttpBasicAuthHandlers = (getMainWindow: () => BrowserWindow | null) => {
  app.on('login', (event, _webContents, _request, authInfo, callback) => {
    const mainWindow = getMainWindow();
    if (mainWindow === null || mainWindow.isDestroyed()) {
      return;
    }
    event.preventDefault();
    handleLogin(authInfo, mainWindow, callback);
  });
};
