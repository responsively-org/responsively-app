import {ipcMain, webContents} from 'electron';
import {IPC_MAIN_CHANNELS} from '../common/constants';
import type {
  DeviceColorScheme,
  SetDeviceColorSchemeArgs,
  SetDeviceColorSchemeResult,
} from '../common/device-options';
import {acquireDebugger} from './debugger-lease';
import {isRegisteredWebview} from './webview-registry';

const leases = new WeakMap<Electron.WebContents, () => void>();
const pending = new WeakMap<Electron.WebContents, Promise<void>>();
const EMULATION_TIMEOUT_MS = 5000;

const withEmulationTimeout = async (work: Promise<unknown>): Promise<void> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      work,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error('The device color scheme did not respond within 5000ms.')),
          EMULATION_TIMEOUT_MS
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

/** Keep media emulation attached across navigation and temporary screenshot/inspector work. */
export const setDeviceColorScheme = (
  contents: Electron.WebContents,
  colorScheme: DeviceColorScheme
): Promise<void> => {
  const update = async () => {
    if (contents.isDestroyed()) {
      throw new Error('Device preview is no longer available.');
    }
    const currentLease = leases.get(contents);
    if (colorScheme === 'system' && currentLease === undefined && !contents.debugger.isAttached()) {
      return;
    }
    let release = currentLease;
    if (release === undefined) {
      const releaseDebugger = acquireDebugger(contents);
      const cleanup = () => {
        contents.removeListener('destroyed', cleanup);
        contents.debugger.removeListener('detach', cleanup);
        if (leases.get(contents) === cleanup) {
          leases.delete(contents);
        }
        releaseDebugger();
      };
      release = cleanup;
      leases.set(contents, release);
      contents.once('destroyed', cleanup);
      contents.debugger.once('detach', cleanup);
    }
    try {
      await withEmulationTimeout(
        contents.debugger.sendCommand('Emulation.setEmulatedMedia', {
          features:
            colorScheme === 'system' ? [] : [{name: 'prefers-color-scheme', value: colorScheme}],
        })
      );
      if (colorScheme === 'system') {
        release();
      }
    } catch (error) {
      release();
      throw error;
    }
  };
  // Root command application and React effects may run together; serialize
  // them so an older request can never finish after a newer one.
  const result = (pending.get(contents) ?? Promise.resolve()).catch(() => {}).then(update);
  pending.set(contents, result);
  return result.finally(() => {
    if (pending.get(contents) === result) {
      pending.delete(contents);
    }
  });
};

export const initDeviceColorSchemeHandlers = () => {
  ipcMain.handle(
    IPC_MAIN_CHANNELS.SET_DEVICE_COLOR_SCHEME,
    async (_, arg: SetDeviceColorSchemeArgs): Promise<SetDeviceColorSchemeResult> => {
      if (
        !isRegisteredWebview(arg.webContentsId) ||
        !['light', 'dark', 'system'].includes(arg.colorScheme)
      ) {
        return {done: false, error: 'Invalid device color scheme request.'};
      }
      const contents = webContents.fromId(arg.webContentsId);
      if (contents === undefined) {
        return {done: false, error: 'Device preview is no longer available.'};
      }
      try {
        await setDeviceColorScheme(contents, arg.colorScheme);
        return {done: true};
      } catch (error) {
        return {done: false, error: error instanceof Error ? error.message : String(error)};
      }
    }
  );
};
