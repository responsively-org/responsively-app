import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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

export const selectRuler =
  (state: RootState) =>
  (resolution: ViewResolution | undefined): RulersState | undefined => {
    if (resolution && state.rulers[resolution]) {
      return state.rulers[resolution];
    }
    return undefined;
  };

export const selectRulerEnabled =
  (state: RootState) => (resolution: ViewResolution | undefined) => {
    if (resolution && state.rulers[resolution]) {
      return state.rulers[resolution].isRulerEnabled;
    }
    return false;
  };

export default rulerSlice.reducer;
