import {IPC_MAIN_CHANNELS} from 'common/constants';
import type {
  DeviceColorScheme,
  SetDeviceColorSchemeArgs,
  SetDeviceColorSchemeResult,
} from 'common/device-options';

export const applyDeviceColorScheme = async (
  webview: Electron.WebviewTag,
  colorScheme: DeviceColorScheme = 'system'
): Promise<void> => {
  const result = await window.electron.ipcRenderer.invoke<
    SetDeviceColorSchemeArgs,
    SetDeviceColorSchemeResult
  >(IPC_MAIN_CHANNELS.SET_DEVICE_COLOR_SCHEME, {
    webContentsId: webview.getWebContentsId(),
    colorScheme,
  });
  if (!result.done) {
    throw new Error(result.error ?? 'Unable to apply the device color scheme.');
  }
};
