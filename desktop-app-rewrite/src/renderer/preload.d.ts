import { Channels } from 'main/preload';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
        invoke(channel: string, ...args: unknown[]): Promise<unknown>;
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
