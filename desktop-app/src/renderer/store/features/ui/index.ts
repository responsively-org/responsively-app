import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';

export const APP_VIEWS = {
  BROWSER: 'BROWSER',
  DEVICE_MANAGER: 'DEVICE_MANAGER',
} as const;

export type AppView = typeof APP_VIEWS[keyof typeof APP_VIEWS];

export type Theme = 'light' | 'dark' | 'violet';

export interface UIState {
  appView: AppView;
  theme: Theme;
}

const initialState: UIState = {
  theme: window.electron.store.get('theme') || 'light',
  appView: APP_VIEWS.BROWSER,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      window.electron.store.set('ui.theme', action.payload);
    },
    setAppView: (state, action: PayloadAction<AppView>) => {
      state.appView = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setTheme, setAppView } = uiSlice.actions;

export const selectTheme = (state: RootState) => state.ui.theme;
export const selectAppView = (state: RootState) => state.ui.appView;

export default uiSlice.reducer;
