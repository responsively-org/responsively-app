import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';

export const APP_VIEWS = {
  BROWSER: 'BROWSER',
  DEVICE_MANAGER: 'DEVICE_MANAGER',
} as const;

export type AppView = typeof APP_VIEWS[keyof typeof APP_VIEWS];

export interface UIState {
  darkMode: boolean;
  appView: AppView;
  menuFlyout: boolean;
}

const initialState: UIState = {
  darkMode: window.electron.store.get('ui.darkMode'),
  appView: APP_VIEWS.BROWSER,
  menuFlyout: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      window.electron.store.set('ui.darkMode', action.payload);
    },
    setAppView: (state, action: PayloadAction<AppView>) => {
      state.appView = action.payload;
    },
    closeMenuFlyout: (state, action: PayloadAction<boolean>) => {
      state.menuFlyout = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setDarkMode, setAppView, closeMenuFlyout } = uiSlice.actions;

export const selectDarkMode = (state: RootState) => state.ui.darkMode;
export const selectAppView = (state: RootState) => state.ui.appView;
export const selectMenuFlyout = (state: RootState) => state.ui.menuFlyout;

export default uiSlice.reducer;
