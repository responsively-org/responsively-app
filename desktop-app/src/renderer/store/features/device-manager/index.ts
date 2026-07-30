import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Device} from 'common/deviceList';
import type {RootState} from '../..';

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface PreviewSuite {
  id: string;
  name: string;
  devices: string[];
  /** Canvas-mode frame positions in world coordinates, keyed by device id. */
  canvasPositions?: Record<string, CanvasPosition>;
}

export type PreviewSuites = PreviewSuite[];

export interface DeviceManagerState {
  devices: Device[];
  activeSuite: string;
  suites: PreviewSuites;
  // Per-device rotation (session state, not persisted). The global rotate
  // flag lives in the renderer slice; a device is rotated when either is set.
  individualRotations: Record<string, boolean>;
}

export const DEFAULT_SUITE: PreviewSuite = {
  id: 'default',
  name: 'Default',
  devices: ['10008', '10013', '10015'],
};

// Persisted values are injected via the store's preloaded state
// (store/preloadedState.ts); persistence happens in store/persistence.ts.
const initialState: DeviceManagerState = {
  devices: [],
  activeSuite: DEFAULT_SUITE.id,
  suites: [DEFAULT_SUITE],
  individualRotations: {},
};

export const deviceManagerSlice = createSlice({
  name: 'deviceManager',
  initialState,
  reducers: {
    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload;
    },
    setSuiteDevices: (state, action: PayloadAction<{suite: string; devices: string[]}>) => {
      const {suite, devices} = action.payload;
      const target = state.suites.find((s) => s.id === suite);
      if (target === undefined) {
        return;
      }
      target.devices = devices;
    },
    setActiveSuite(state, action: PayloadAction<string>) {
      state.activeSuite = action.payload;
    },
    addSuite(state, action: PayloadAction<PreviewSuite>) {
      state.suites.push(action.payload);
      state.activeSuite = action.payload.id;
    },
    addSuites(state, action: PayloadAction<PreviewSuite[]>) {
      const suitesMap = new Map<string, PreviewSuite>();
      action.payload.forEach((suite) => suitesMap.set(suite.name, suite));

      state.suites.forEach((suite) => {
        if (!suitesMap.has(suite.name)) {
          suitesMap.set(suite.name, suite);
        }
      });

      state.suites = Array.from(suitesMap.values());
      state.activeSuite = action.payload[0].id;
    },
    deleteSuite(state, action: PayloadAction<string>) {
      const suiteIndex = state.suites.findIndex((s) => s.id === action.payload);
      if (suiteIndex === -1) {
        return;
      }
      state.suites.splice(suiteIndex, 1);
      state.activeSuite = state.suites[0].id;
    },
    deleteAllSuites(state) {
      state.suites = [DEFAULT_SUITE];
      state.activeSuite = DEFAULT_SUITE.id;
    },
    setCanvasPosition(
      state,
      action: PayloadAction<{suite: string; device: string; position: CanvasPosition}>
    ) {
      const target = state.suites.find((s) => s.id === action.payload.suite);
      if (target === undefined) {
        return;
      }
      target.canvasPositions = {
        ...target.canvasPositions,
        [action.payload.device]: action.payload.position,
      };
    },
    resetCanvasPositions(state, action: PayloadAction<string>) {
      const target = state.suites.find((s) => s.id === action.payload);
      if (target !== undefined) {
        delete target.canvasPositions;
      }
    },
    setIndividualRotation(state, action: PayloadAction<{id: string; rotated: boolean}>) {
      const {id, rotated} = action.payload;
      if (rotated) {
        state.individualRotations[id] = true;
      } else {
        delete state.individualRotations[id];
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setDevices,
  setSuiteDevices,
  setActiveSuite,
  addSuite,
  addSuites,
  deleteSuite,
  deleteAllSuites,
  setCanvasPosition,
  resetCanvasPositions,
  setIndividualRotation,
} = deviceManagerSlice.actions;

export const selectSuites = (state: RootState) => state.deviceManager.suites;

export const selectIndividualRotations = (state: RootState) =>
  state.deviceManager.individualRotations;

export const selectActiveSuite = (state: RootState): PreviewSuite => {
  const {activeSuite, suites} = state.deviceManager;
  return suites.find((suite) => suite.id === activeSuite) ?? suites[0];
};

export default deviceManagerSlice.reducer;
