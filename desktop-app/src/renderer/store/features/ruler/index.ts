import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import type { RootState } from '../..';

export interface Coordinates {
  deltaX: number;
  deltaY: number;
  innerHeight: number;
  innerWidth: number;
}

export type RulersState = {
  isRulerEnabled: boolean;
  rulerCoordinates: Coordinates;
};

export type ViewResolution = string;

const initialState: { [key: ViewResolution]: RulersState } = {};

export const rulerSlice = createSlice({
  name: 'rulers',
  initialState,
  reducers: {
    setRuler: (
      state,
      action: PayloadAction<{
        rulerState: RulersState;
        resolution: ViewResolution;
      }>
    ) => {
      state[action.payload.resolution] = action.payload.rulerState;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setRuler } = rulerSlice.actions;

export const selectRuler = createSelector(
  [
    (state: RootState) => state.rulers,
    (_: RootState, resolution: ViewResolution | undefined) => resolution,
  ],
  (rulers, resolution): RulersState | undefined => {
    if (resolution && rulers[resolution]) {
      return rulers[resolution];
    }
    return undefined;
  }
);

export const selectRulerEnabled = createSelector(
  [
    (state: RootState) => state.rulers,
    (_: RootState, resolution: ViewResolution | undefined) => resolution,
  ],
  (rulers, resolution): boolean => {
    if (resolution && rulers[resolution]) {
      return rulers[resolution].isRulerEnabled;
    }
    return false;
  }
);

export default rulerSlice.reducer;
