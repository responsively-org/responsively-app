import type {DeviceColorScheme} from 'common/device-options';
import {useEffect, type RefObject} from 'react';
import {applyDeviceColorScheme} from 'renderer/lib/device-color-scheme';

/** Reapply the session preference when a device remounts or navigates. */
const useDeviceColorScheme = (
  ref: RefObject<Electron.WebviewTag | null>,
  webviewReady: boolean,
  colorScheme: DeviceColorScheme | undefined
) => {
  useEffect(() => {
    const webview = ref.current;
    if (webview === null) {
      return undefined;
    }
    const apply = () => {
      applyDeviceColorScheme(webview, colorScheme).catch((error) => {
        console.error('Unable to apply the device color scheme', error);
      });
    };
    if (webviewReady) {
      apply();
    }
    webview.addEventListener('dom-ready', apply);
    return () => {
      webview.removeEventListener('dom-ready', apply);
    };
  }, [ref, webviewReady, colorScheme]);
};

export default useDeviceColorScheme;
