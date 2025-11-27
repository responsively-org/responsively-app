import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';

export interface MeasurementPoint {
  x: number;
  y: number;
}

export interface Measurement {
  id: string;
  startPoint: MeasurementPoint;
  endPoint: MeasurementPoint;
  deviceId: string;
}

export interface ElementMeasurementState {
  isEnabled: boolean;
  activeDeviceId: string | null;
  startPoint: MeasurementPoint | null;
  measurements: Measurement[];
}

const initialState: ElementMeasurementState = {
  isEnabled: false,
  activeDeviceId: null,
  startPoint: null,
  measurements: [],
};

export const elementMeasurementSlice = createSlice({
  name: 'elementMeasurement',
  initialState,
  reducers: {
    setMeasurementEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload;
      if (!action.payload) {
        state.startPoint = null;
        state.activeDeviceId = null;
      }
    },
    setActiveDevice: (state, action: PayloadAction<string | null>) => {
      state.activeDeviceId = action.payload;
    },
    setStartPoint: (
      state,
      action: PayloadAction<{
        point: MeasurementPoint;
        deviceId: string;
      } | null>
    ) => {
      if (action.payload) {
        state.startPoint = action.payload.point;
        state.activeDeviceId = action.payload.deviceId;
      } else {
        state.startPoint = null;
      }
    },
    addMeasurement: (state, action: PayloadAction<Measurement>) => {
      state.measurements.push(action.payload);
      state.startPoint = null;
    },
    removeMeasurement: (state, action: PayloadAction<string>) => {
      state.measurements = state.measurements.filter(
        (m) => m.id !== action.payload
      );
    },
    clearMeasurements: (state) => {
      state.measurements = [];
      state.startPoint = null;
    },
    clearDeviceMeasurements: (state, action: PayloadAction<string>) => {
      state.measurements = state.measurements.filter(
        (m) => m.deviceId !== action.payload
      );
    },
  },
});

export const {
  setMeasurementEnabled,
  setActiveDevice,
  setStartPoint,
  addMeasurement,
  removeMeasurement,
  clearMeasurements,
  clearDeviceMeasurements,
} = elementMeasurementSlice.actions;

export const selectMeasurementEnabled = (state: RootState) =>
  state.elementMeasurement.isEnabled;

export const selectActiveDeviceId = (state: RootState) =>
  state.elementMeasurement.activeDeviceId;

export const selectStartPoint = (state: RootState) =>
  state.elementMeasurement.startPoint;

export const selectMeasurements = (state: RootState) =>
  state.elementMeasurement.measurements;

export const selectDeviceMeasurements =
  (deviceId: string) => (state: RootState) =>
    state.elementMeasurement.measurements.filter(
      (m) => m.deviceId === deviceId
    );

export default elementMeasurementSlice.reducer;
