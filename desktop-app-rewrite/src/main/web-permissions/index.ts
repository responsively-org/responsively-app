import { BrowserWindow, session } from 'electron';
import PermissionsManager, { PERMISSION_STATE } from './PermissionsManager';

// eslint-disable-next-line import/prefer-default-export
export const initWebPermissionHandlers = (mainWindow: BrowserWindow) => {
  const permissionsManager = new PermissionsManager(mainWindow);
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      permissionsManager.requestPermission(
        new URL(webContents.getURL()).origin,
        permission,
        callback
      );
    }
  );

  session.defaultSession.setPermissionCheckHandler(
    (_webContents, permission, requestingOrigin) => {
      const status = permissionsManager.getPermissionState(
        requestingOrigin,
        permission
      );
      return status === PERMISSION_STATE.GRANTED;
    }
  );
};
