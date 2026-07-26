import {app, ipcMain, shell} from 'electron';
import path from 'path';
import {IPC_MAIN_CHANNELS} from '../../common/constants';
import store, {isRendererStoreKey} from '../../store';
import log from '../logging';

export interface AppMetaResponse {
  appVersion: string;
  webviewPreloadPath: string;
}

const EXTERNAL_PROTOCOLS = ['http:', 'https:', 'mailto:'];

const isSafeExternalUrl = (url: unknown): url is string => {
  if (typeof url !== 'string') {
    return false;
  }
  try {
    return EXTERNAL_PROTOCOLS.includes(new URL(url).protocol);
  } catch {
    return false;
  }
};

export const initAppMetaHandlers = () => {
  ipcMain.handle(IPC_MAIN_CHANNELS.APP_META, async (): Promise<AppMetaResponse> => {
    const isBuiltApp = app.isPackaged || process.env.E2E_TEST === 'true';
    return {
      webviewPreloadPath: isBuiltApp
        ? path.join(__dirname, 'preload-webview.js')
        : path.join(__dirname, '../../../.erb/dll/preload-webview.js'),
      appVersion: app.getVersion(),
    };
  });

  ipcMain.on(IPC_MAIN_CHANNELS.ELECTRON_STORE_GET, (event, val) => {
    if (!isRendererStoreKey(val)) {
      log.warn('[store-bridge] blocked read of key', val);
      event.returnValue = undefined;
      return;
    }
    event.returnValue = store.get(val);
  });
  ipcMain.on(IPC_MAIN_CHANNELS.ELECTRON_STORE_SET, (_, key, val) => {
    if (!isRendererStoreKey(key)) {
      log.warn('[store-bridge] blocked write to key', key);
      return;
    }
    store.set(key, val);
  });

  ipcMain.on(IPC_MAIN_CHANNELS.OPEN_EXTERNAL, async (_, {url}) => {
    if (!isSafeExternalUrl(url)) {
      log.warn('[open-external] blocked url', url);
      return;
    }
    log.info('Opening external url', url);
    shell.openExternal(url);
  });
};
