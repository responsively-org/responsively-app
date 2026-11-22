import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '../..';

export interface EventMirroringState {
  enabledByDevice: Record<string, boolean>;
}

const initialState: EventMirroringState = {enabledByDevice: {}};

const eventMirroringSlice = createSlice({
  name: 'eventMirroring',
  initialState,
  reducers: {
    setEventMirroring: (
      state,
      {payload}: PayloadAction<{deviceIds: string[]; enabled: boolean}>
    ) => {
      for (const id of payload.deviceIds) {
        state.enabledByDevice[id] = payload.enabled;
      }
    },
  },
});

export const {setEventMirroring} = eventMirroringSlice.actions;

export const selectEventMirroringEnabled = (state: RootState, deviceId: string): boolean =>
  state.eventMirroring.enabledByDevice[deviceId] ?? true;

export default eventMirroringSlice.reducer;
