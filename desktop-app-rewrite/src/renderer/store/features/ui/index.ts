import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';

export interface UIState {
  darkMode: boolean;
}

const initialState: UIState = {
  darkMode: window.electron.store.get('ui.darkMode'),
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      window.electron.store.set('ui.darkMode', action.payload);
    },
  },
});

// Action creators are generated for each case reducer function
export const { setDarkMode } = uiSlice.actions;

export const selectDarkMode = (state: RootState) => state.ui.darkMode;

export default uiSlice.reducer;
