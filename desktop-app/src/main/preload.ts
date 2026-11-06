/* eslint-disable @typescript-eslint/no-explicit-any -- generic IPC bridge is intentionally untyped */
import {Channels, IPC_MAIN_CHANNELS} from 'common/constants';
import {contextBridge, ipcRenderer, IpcRendererEvent} from 'electron';

// `on` registers a wrapper that drops the IPC event, so the caller's own function is never the
// registered listener. These are kept to let `removeListener` find the wrapper it stands for.
const registrations: Array<{channel: string; func: unknown; unsubscribe: () => void}> = [];

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage<T>(channel: Channels, args: T[]) {
      ipcRenderer.send(channel, args);
    },
    on<T>(channel: Channels, func: (...args: T[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: T[]) => func(...args);
      ipcRenderer.on(channel, subscription);

      const registration = {
        channel,
        func,
        unsubscribe: () => {
          ipcRenderer.removeListener(channel, subscription);
          const index = registrations.indexOf(registration);
          if (index !== -1) registrations.splice(index, 1);
        },
      };
      registrations.push(registration);
      return registration.unsubscribe;
    },
    once<T>(channel: Channels, func: (...args: T[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke<T, P>(channel: Channels, ...args: T[]): Promise<P> {
      return ipcRenderer.invoke(channel, ...args);
    },
    removeListener(channel: Channels, listener: (...args: any[]) => void) {
      // Most recent first, as EventEmitter does when a function is registered twice.
      const registration = [...registrations]
        .reverse()
        .find((r) => r.channel === channel && r.func === listener);
      registration?.unsubscribe();
    },
    removeAllListeners(channel: Channels) {
      ipcRenderer.removeAllListeners(channel);
      for (let i = registrations.length - 1; i >= 0; i -= 1) {
        if (registrations[i].channel === channel) registrations.splice(i, 1);
      }
    },
  },
  store: {
    get(val: any) {
      return ipcRenderer.sendSync(IPC_MAIN_CHANNELS.ELECTRON_STORE_GET, val);
    },
    set(property: string, val: any) {
      ipcRenderer.send(IPC_MAIN_CHANNELS.ELECTRON_STORE_SET, property, val);
    },
    // Other method you want to add like has(), reset(), etc.
  },
});

window.onerror = function (errorMsg, url, lineNumber) {
  console.log(`Unhandled error: ${errorMsg} ${url} ${lineNumber}`);
  // Code to run when an error has occurred on the page
};
