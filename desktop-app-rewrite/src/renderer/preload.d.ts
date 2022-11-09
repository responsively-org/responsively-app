import { Channels } from 'main/preload';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on<T>(
          channel: string,
          func: (...args: T[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
        invoke<T, P>(channel: string, ...args: T[]): Promise<P>;
        removeListener(
          channel: string,
          func: (...args: unknown[]) => void
        ): void;
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
