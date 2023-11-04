import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';

export interface Coordinates {
  deltaX: number;
  deltaY: number;
  innerHeight: number;
  innerWidth: number;
}

export interface RulersState {
  isRulerEnabled: boolean;
  rulerCoordinates: Coordinates;
  webViewId: number;
}

const initialState: RulersState = {
  isRulerEnabled: false,
  rulerCoordinates: { deltaX: 0, deltaY: 0, innerHeight: 0, innerWidth: 0 },
  webViewId: -1,
};

export const rulerSlice = createSlice({
  name: 'rulers',
  initialState,
  reducers: {
    setRulersEnabled: (state, action: PayloadAction<RulersState>) => {
      state.isRulerEnabled = true;
      state.webViewId = action.payload.webViewId;
    },
    setRulerCoordinates: (state, action: PayloadAction<Coordinates>) => {
      state.rulerCoordinates = action.payload;
    },
    setRulersDisabled: (state, action: PayloadAction<RulersState>) => {
      state.isRulerEnabled = false;
      state.webViewId = action.payload.webViewId;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setRulersEnabled, setRulersDisabled, setRulerCoordinates } =
  rulerSlice.actions;

export const selectRulerCoordinates = (state: RootState) =>
  state.rulers.rulerCoordinates;

export const selectRulerWebviewId = (state: RootState) =>
  state.rulers.webViewId;

export default rulerSlice.reducer;
