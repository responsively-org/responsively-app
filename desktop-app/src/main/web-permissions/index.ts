import {BrowserWindow, session, ipcMain} from 'electron';
import PermissionsManager, {PERMISSION_STATE} from './PermissionsManager';
import {IPC_MAIN_CHANNELS} from '../../common/constants';
import store from '../../store';

// eslint-disable-next-line import/prefer-default-export
export const WebPermissionHandlers = (mainWindow: BrowserWindow) => {
  const permissionsManager = new PermissionsManager(mainWindow);
  return {
    init: () => {
      session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        permissionsManager.requestPermission(
          new URL(webContents.getURL()).origin,
          permission,
          callback
        );
      });

      session.defaultSession.setPermissionCheckHandler(
        (_webContents, permission, requestingOrigin) => {
          const status = permissionsManager.getPermissionState(requestingOrigin, permission);
          return status === PERMISSION_STATE.GRANTED;
        }
      );

      session.defaultSession.webRequest.onBeforeSendHeaders(
        {
          urls: ['<all_urls>'],
        },
        (details, callback) => {
          const acceptLanguage = store.get('userPreferences.webRequestHeaderAcceptLanguage');
          if (acceptLanguage != null && acceptLanguage !== '') {
            details.requestHeaders['Accept-Language'] = store.get(
              'userPreferences.webRequestHeaderAcceptLanguage'
            );
          }
          callback({requestHeaders: details.requestHeaders});
        }
      );

      // Add IPC handlers for site permissions management
      ipcMain.handle(IPC_MAIN_CHANNELS.GET_SITE_PERMISSIONS, (_event, origin: string) => {
        return permissionsManager.getSitePermissions(origin);
      });

      ipcMain.handle(
        IPC_MAIN_CHANNELS.UPDATE_SITE_PERMISSION,
        (_event, {origin, type, state}: {origin: string; type: string; state: string}) => {
          permissionsManager.updateSitePermission(
            origin,
            type,
            state as (typeof PERMISSION_STATE)[keyof typeof PERMISSION_STATE]
          );
          return true;
        }
      );

      ipcMain.handle(IPC_MAIN_CHANNELS.CLEAR_SITE_PERMISSIONS, (_event, origin: string) => {
        permissionsManager.clearSitePermissions(origin);
        return true;
      });
    },
  };
};
