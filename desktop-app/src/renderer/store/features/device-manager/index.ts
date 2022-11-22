import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { defaultDevicesMap, Device } from 'common/deviceList';
import type { RootState } from '../..';

const defaultDeviceNames: string[] = window.electron.store.get(
  'deviceManager.activeDevices'
);

const DEFAULT_DEVICES: Device[] = defaultDeviceNames.map(
  (name) => defaultDevicesMap[name]
);

export interface DeviceManagerState {
  devices: Device[];
}

const initialState: DeviceManagerState = {
  devices: DEFAULT_DEVICES,
};

export const deviceManagerSlice = createSlice({
  name: 'deviceManager',
  initialState,
  reducers: {
    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload;
      window.electron.store.set(
        'deviceManager.activeDevices',
        action.payload.map((device) => device.name)
      );
    },
  },
});

// Action creators are generated for each case reducer function
export const { setDevices } = deviceManagerSlice.actions;

export const selectDevices = (state: RootState) => state.deviceManager.devices;

export default deviceManagerSlice.reducer;
