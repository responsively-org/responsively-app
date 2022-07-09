import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  darkMode: boolean;
}

const initialState: UIState = {
  darkMode: true,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      console.log('setDarkMode reducer', action.payload);
      state.darkMode = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setDarkMode } = uiSlice.actions;

export default uiSlice.reducer;
