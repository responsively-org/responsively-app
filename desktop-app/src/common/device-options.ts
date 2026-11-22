export type DeviceColorScheme = 'light' | 'dark' | 'system';

export interface ViewportOptions {
  width?: number;
  height?: number;
  orientation?: 'portrait' | 'landscape';
  colorScheme?: DeviceColorScheme;
}

export interface SetDeviceColorSchemeArgs {
  webContentsId: number;
  colorScheme: DeviceColorScheme;
}

export interface SetDeviceColorSchemeResult {
  done: boolean;
  error?: string;
}
