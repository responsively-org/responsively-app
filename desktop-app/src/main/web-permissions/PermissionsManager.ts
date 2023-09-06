import { BrowserWindow, ipcMain } from 'electron';
import { IPC_MAIN_CHANNELS } from '../../common/constants';
import store from '../../store';

export interface PermissionRequestArg {
  permission: string;
  requestingOrigin: string;
}

export interface PermissionResponseArg {
  permissionRequest: PermissionRequestArg;
  allow: boolean;
}

export const PERMISSION_STATE = {
  GRANTED: 'GRANTED',
  DENIED: 'DENIED',
  PROMPT: 'PROMPT',
  UNKNOWN: 'UNKNOWN',
} as const;

type PermissionState = typeof PERMISSION_STATE[keyof typeof PERMISSION_STATE];

interface PersistedPermission {
  origin: string;
  permissions: {
    type: string;
    status: PermissionState;
  }[];
}

type PermissionRecords = Record<string, PermissionState>;

type PermissionCallback = (permissionGranted: boolean) => void;

const loadPermissions = () => {
  const permissions = (store.get('webPermissions') as PersistedPermission[])
    .map(({ origin, permissions: permissionRecords }) => {
      return {
        origin,
        permissions: permissionRecords.reduce((acc, { type, status }) => {
          acc[type] = status;
          return acc;
        }, {} as PermissionRecords),
      };
    })
    .reduce((acc, { origin, permissions: permissionRecords }) => {
      acc[origin] = permissionRecords;
      return acc;
    }, {} as Record<string, PermissionRecords>);

  return permissions;
};

const savePermissions = (permissions: Record<string, PermissionRecords>) => {
  const persistedPermissions = Object.entries(permissions).map(
    ([origin, permissionRecords]) => {
      return {
        origin,
        permissions: Object.entries(permissionRecords)
          .filter(([_, status]) => {
            return (
              status === PERMISSION_STATE.GRANTED ||
              status === PERMISSION_STATE.DENIED
            );
          })
          .map(([type, status]) => {
            return {
              type,
              status,
            };
          }),
      };
    }
  );
  store.set('webPermissions', persistedPermissions);
};

class PermissionsManager {
  permissions: Record<string, PermissionRecords>;

  callbacks: Record<string, PermissionCallback[]> = {};

  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.permissions = loadPermissions();
    const handler = (
      _event: Electron.IpcMainInvokeEvent,
      arg: PermissionResponseArg
    ) => {
      this.setPermissionState(
        arg.permissionRequest.requestingOrigin,
        arg.permissionRequest.permission,
        arg.allow ? PERMISSION_STATE.GRANTED : PERMISSION_STATE.DENIED
      );
      const key = `${arg.permissionRequest.requestingOrigin}-${arg.permissionRequest.permission}`;
      const callbacks = this.callbacks[key];

      if (callbacks) {
        callbacks.forEach((callback) => callback(arg.allow));
        this.callbacks[key] = [];
      }
    };
    const PERMISSION_RESPONSE_CHANNEL = IPC_MAIN_CHANNELS.PERMISSION_RESPONSE;
    if (ipcMain.listeners(PERMISSION_RESPONSE_CHANNEL).length === 0) {
      try {
        ipcMain.handle(PERMISSION_RESPONSE_CHANNEL, handler);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(
          'Error adding listener for permission response channel',
          e
        );
      }
    }
  }

  getPermissionState(origin: string, type: string): PermissionState {
    const permissions = this.permissions[origin];
    return permissions ? permissions[type] : PERMISSION_STATE.UNKNOWN;
  }

  setPermissionState(origin: string, type: string, state: PermissionState) {
    const permissions = this.permissions[origin];
    if (permissions) {
      permissions[type] = state;
    } else {
      this.permissions[origin] = {
        [type]: state,
      };
    }
    savePermissions(this.permissions);
  }

  requestPermission(
    origin: string,
    type: string,
    callback: PermissionCallback
  ): void {
    this.permissions[origin] = this.permissions[origin] || {};
    const previousState = this.permissions[origin][type];
    if (previousState !== PERMISSION_STATE.GRANTED) {
      this.permissions[origin][type] = PERMISSION_STATE.PROMPT;
    }
    const key = `${origin}-${type}`;
    let callbacks = this.callbacks[key];
    if (callbacks === undefined) {
      callbacks = [];
      this.callbacks[key] = callbacks;
    }
    if (previousState === PERMISSION_STATE.GRANTED) {
      callback(true);
      return;
    }
    if (previousState === PERMISSION_STATE.DENIED) {
      callback(false);
      return;
    }
    callbacks.push(callback);
    if (previousState === PERMISSION_STATE.PROMPT) {
      return;
    }
    this.mainWindow.webContents.send(IPC_MAIN_CHANNELS.PERMISSION_REQUEST, {
      permission: type,
      requestingOrigin: origin,
    });
  }
}

export default PermissionsManager;
