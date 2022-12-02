import type { Channels } from 'common/constants';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage<T>(channel: Channels, ...args: T[]): void;
        on<T>(
          channel: string,
          func: (...args: T[]) => void
        ): (() => void) | undefined;
        once<T>(channel: string, func: (...args: T[]) => void): void;
        invoke<T, P>(channel: string, ...args: T[]): Promise<P>;
        removeListener<T>(channel: string, func: (...args: T[]) => void): void;
        removeAllListeners(channel: string): void;
      };
      store: {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        get: (key: string) => any;
        set: (key: string, val: any) => void;
      };
    };
    responsively: {
      webviewPreloadPath: string;
    };
  }
}

export {};
