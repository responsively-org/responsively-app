import { BrowserWindow, session } from 'electron';
import PermissionsManager, { PERMISSION_STATE } from './PermissionsManager';
import store from '../../store';

// eslint-disable-next-line import/prefer-default-export
export const WebPermissionHandlers = (mainWindow: BrowserWindow) => {
  const permissionsManager = new PermissionsManager(mainWindow);
  return {
    init: () => {
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

      session.defaultSession.webRequest.onBeforeSendHeaders(
        {
          urls: ['<all_urls>'],
        },
        (details, callback) => {
          const acceptLanguage = store.get(
            'userPreferences.webRequestHeaderAcceptLanguage'
          );
          if (acceptLanguage != null && acceptLanguage !== '') {
            details.requestHeaders['Accept-Language'] = store.get(
              'userPreferences.webRequestHeaderAcceptLanguage'
            );
          }
          callback({ requestHeaders: details.requestHeaders });
        }
      );
    },
  };
};
