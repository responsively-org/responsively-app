import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DeviceRotationMap } from 'common/session';
import type { RootState } from '../..';

interface DeviceOrientationState {
  rotations: DeviceRotationMap;
}

const initialState: DeviceOrientationState = {
  rotations: {},
};

const deviceOrientationSlice = createSlice({
  name: 'deviceOrientation',
  initialState,
  reducers: {
    setDeviceRotation(
      state,
      action: PayloadAction<{ deviceId: string; rotated: boolean }>
    ) {
      state.rotations[action.payload.deviceId] = action.payload.rotated;
    },
    setAllDeviceRotations(state, action: PayloadAction<DeviceRotationMap>) {
      state.rotations = { ...(action.payload || {}) };
    },
    syncDeviceRotations(state, action: PayloadAction<string[]>) {
      const activeIds = new Set(action.payload);
      Object.keys(state.rotations).forEach((deviceId) => {
        if (!activeIds.has(deviceId)) {
          delete state.rotations[deviceId];
        }
      });
    },
    resetDeviceRotations(state) {
      state.rotations = {};
    },
  },
});

export const {
  setDeviceRotation,
  setAllDeviceRotations,
  syncDeviceRotations,
  resetDeviceRotations,
} = deviceOrientationSlice.actions;

export const selectDeviceRotationById = (state: RootState, deviceId: string) =>
  state.deviceOrientation.rotations[deviceId] ?? false;

export const selectDeviceRotationState = (state: RootState) =>
  state.deviceOrientation.rotations;

export default deviceOrientationSlice.reducer;
