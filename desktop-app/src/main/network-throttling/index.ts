import { ipcMain, webContents } from 'electron';
import { IPC_MAIN_CHANNELS } from '../../common/constants';
import {
  networkProfiles,
  type NetworkProfile,
} from '../../common/networkProfiles';

export interface SetNetworkProfileArgs {
  webContentsId: number;
  profile: NetworkProfile;
}

export interface SetNetworkProfileResult {
  success: boolean;
}

type OnBeforeRequestListener = (
  details: Electron.OnBeforeRequestListenerDetails,
  callback: (response: Electron.CallbackResponse) => void
) => void;

// Track offline state and ensure we only register a single blocker per session
const offlineSessions = new WeakSet<Electron.Session>();
const sessionRequestBlockers = new WeakMap<
  Electron.Session,
  OnBeforeRequestListener
>();

const isAllowedDevRequest = (url: string) => {
  return (
    url.includes('localhost:12719') ||
    url.includes('127.0.0.1:12719') ||
    url.includes('browser-sync') ||
    url.includes('localhost:1212') ||
    url.includes('127.0.0.1:1212')
  );
};

const ensureOfflineRequestBlocker = (session: Electron.Session) => {
  if (sessionRequestBlockers.has(session)) {
    return;
  }

  const blocker: OnBeforeRequestListener = (details, callback) => {
    if (!offlineSessions.has(session)) {
      callback({});
      return;
    }

    if (isAllowedDevRequest(details.url)) {
      callback({});
      return;
    }

    callback({ cancel: true });
  };

  session.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, blocker);
  sessionRequestBlockers.set(session, blocker);
};

// Use Chrome DevTools Protocol for network throttling
// This is more reliable than Electron's enableNetworkEmulation for webviews
const applyNetworkConditionsViaCDP = async (
  wc: Electron.WebContents,
  config: {
    offline: boolean;
    latency: number;
    downloadThroughput: number;
    uploadThroughput: number;
  }
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
    const webContentsDebugger = wc.debugger;

    // Attach debugger if not already attached
    if (!webContentsDebugger.isAttached()) {
      webContentsDebugger.attach('1.3');
    }

    // Enable Network domain
    await webContentsDebugger.sendCommand('Network.enable');

    if (config.offline) {
      // Offline mode
      await webContentsDebugger.sendCommand(
        'Network.emulateNetworkConditions',
        {
          offline: true,
          latency: 0,
          downloadThroughput: 0,
          uploadThroughput: 0,
        }
      );
    } else if (config.downloadThroughput === -1) {
      // Online mode - disable throttling
      await webContentsDebugger.sendCommand(
        'Network.emulateNetworkConditions',
        {
          offline: false,
          latency: 0,
          downloadThroughput: -1,
          uploadThroughput: -1,
        }
      );
    } else {
      // Throttled mode
      await webContentsDebugger.sendCommand(
        'Network.emulateNetworkConditions',
        {
          offline: false,
          latency: config.latency,
          // CDP uses bytes per second, same as our config
          downloadThroughput: config.downloadThroughput,
          uploadThroughput: config.uploadThroughput,
        }
      );
    }

    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to apply network conditions via CDP:', err);
    return false;
  }
};

const setNetworkProfile = async (
  _event: Electron.IpcMainInvokeEvent,
  arg: SetNetworkProfileArgs
): Promise<SetNetworkProfileResult> => {
  const { webContentsId, profile } = arg;
  const webviewContents = webContents.fromId(webContentsId);

  if (webviewContents === undefined) {
    return { success: false };
  }

  try {
    const config = networkProfiles[profile];
    const { session } = webviewContents;

    // Use CDP for network throttling (more reliable for webviews)
    const cdpSuccess = await applyNetworkConditionsViaCDP(webviewContents, {
      offline: config.offline,
      latency: config.latency,
      downloadThroughput: config.downloadThroughput,
      uploadThroughput: config.uploadThroughput,
    });

    if (config.offline) {
      offlineSessions.add(session);
      ensureOfflineRequestBlocker(session);

      // Also use session-level emulation as backup
      session.enableNetworkEmulation({
        offline: true,
        latency: 0,
        downloadThroughput: 0,
        uploadThroughput: 0,
      });

      // Clear cache and storage after blocking to prevent showing cached content
      session.clearCache().catch(() => {});
      session.clearStorageData({}).catch(() => {});

      // eslint-disable-next-line no-console
      console.log(
        `[Network] Offline mode enabled for webContents ${webContentsId} (CDP: ${cdpSuccess})`
      );
    } else {
      offlineSessions.delete(session);

      if (config.downloadThroughput === -1) {
        // Online mode - disable network emulation completely
        session.disableNetworkEmulation();
        // eslint-disable-next-line no-console
        console.log(
          `[Network] Online mode enabled for webContents ${webContentsId} (CDP: ${cdpSuccess})`
        );
      } else {
        // Throttled mode - also apply session-level as backup
        session.enableNetworkEmulation({
          offline: false,
          latency: config.latency,
          downloadThroughput: config.downloadThroughput,
          uploadThroughput: config.uploadThroughput,
        });
        // eslint-disable-next-line no-console
        console.log(
          `[Network] Throttling enabled for webContents ${webContentsId}:`,
          `${config.label} - ${(
            config.downloadThroughput /
            1024 /
            1024
          ).toFixed(1)} Mbps,`,
          `${config.latency}ms latency (CDP: ${cdpSuccess})`
        );
      }
    }

    return { success: true };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to set network profile:', error);
    return { success: false };
  }
};

export const initNetworkThrottlingHandlers = () => {
  ipcMain.handle(IPC_MAIN_CHANNELS.SET_NETWORK_PROFILE, setNetworkProfile);
};
