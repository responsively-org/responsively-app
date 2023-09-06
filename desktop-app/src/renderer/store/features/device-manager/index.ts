import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getDevicesMap, Device } from 'common/deviceList';
import type { RootState } from '../..';
import { sanitizeSuites } from './utils';

const activeDeviceIds: string[] = window.electron.store.get(
  'deviceManager.activeDevices'
);

const DEFAULT_DEVICES: Device[] = activeDeviceIds.map(
  (id) => getDevicesMap()[id]
);

export interface PreviewSuite {
  id: string;
  name: string;
  devices: string[];
}

export type PreviewSuites = PreviewSuite[];

export interface DeviceManagerState {
  devices: Device[];
  activeSuite: string;
  suites: PreviewSuites;
}

sanitizeSuites();

const initialState: DeviceManagerState = {
  devices: DEFAULT_DEVICES,
  activeSuite: 'default',
  suites: window.electron.store.get('deviceManager.previewSuites'),
};

export const deviceManagerSlice = createSlice({
  name: 'deviceManager',
  initialState,
  reducers: {
    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload;
      window.electron.store.set(
        'deviceManager.activeDevices',
        action.payload.map((device) => device.id)
      );
    },
    setSuiteDevices: (
      state,
      action: PayloadAction<{ suite: string; devices: string[] }>
    ) => {
      const { suite, devices } = action.payload;
      const suites: PreviewSuites = window.electron.store.get(
        'deviceManager.previewSuites'
      );
      const suiteIndex = suites.findIndex((s) => s.id === suite);
      if (suiteIndex === -1) {
        return;
      }
      suites[suiteIndex].devices = devices;
      state.suites = suites;
      window.electron.store.set('deviceManager.previewSuites', suites);
    },
    setActiveSuite(state, action: PayloadAction<string>) {
      state.activeSuite = action.payload;
    },
    addSuite(state, action: PayloadAction<PreviewSuite>) {
      const suites = window.electron.store.get('deviceManager.previewSuites');
      suites.push(action.payload);
      state.suites = suites;
      state.activeSuite = action.payload.id;
      window.electron.store.set('deviceManager.previewSuites', suites);
    },
    deleteSuite(state, action: PayloadAction<string>) {
      const suites: PreviewSuite[] = window.electron.store.get(
        'deviceManager.previewSuites'
      );
      const suiteIndex = suites.findIndex((s) => s.id === action.payload);
      if (suiteIndex === -1) {
        return;
      }
      suites.splice(suiteIndex, 1);
      state.suites = suites;
      state.activeSuite = suites[0].id;
      window.electron.store.set('deviceManager.previewSuites', suites);
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setDevices,
  setSuiteDevices,
  setActiveSuite,
  addSuite,
  deleteSuite,
} = deviceManagerSlice.actions;

export const selectSuites = (state: RootState) => state.deviceManager.suites;

export const selectActiveSuite = (state: RootState): PreviewSuite => {
  const { activeSuite, suites } = state.deviceManager;
  return suites.find((suite) => suite.id === activeSuite) ?? suites[0];
};

export default deviceManagerSlice.reducer;
