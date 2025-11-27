import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';
import type { ThemePreset, CustomTheme } from 'common/themePresets';

export const APP_VIEWS = {
  BROWSER: 'BROWSER',
  DEVICE_MANAGER: 'DEVICE_MANAGER',
} as const;

export type AppView = typeof APP_VIEWS[keyof typeof APP_VIEWS];

export interface UIState {
  darkMode: boolean;
  appView: AppView;
  menuFlyout: boolean;
  themePreset: ThemePreset;
  customTheme: CustomTheme | null;
}

const initialState: UIState = {
  darkMode: window.electron.store.get('ui.darkMode') ?? false,
  appView: APP_VIEWS.BROWSER,
  menuFlyout: false,
  themePreset: (window.electron.store.get('ui.themePreset') as ThemePreset) ?? 'dark',
  customTheme: (window.electron.store.get('ui.customTheme') as CustomTheme | null) ?? null,
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
    setThemePreset: (state, action: PayloadAction<ThemePreset>) => {
      state.themePreset = action.payload;
      window.electron.store.set('ui.themePreset', action.payload);
      // Update darkMode based on preset
      if (action.payload === 'light') {
        state.darkMode = false;
      } else if (action.payload === 'dark') {
        state.darkMode = true;
      }
    },
    setCustomTheme: (state, action: PayloadAction<CustomTheme | null>) => {
      state.customTheme = action.payload;
      window.electron.store.set('ui.customTheme', action.payload);
      if (action.payload) {
        state.themePreset = 'custom';
        window.electron.store.set('ui.themePreset', 'custom');
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { setDarkMode, setAppView, closeMenuFlyout, setThemePreset, setCustomTheme } = uiSlice.actions;

export const selectDarkMode = (state: RootState) => state.ui.darkMode;
export const selectAppView = (state: RootState) => state.ui.appView;
export const selectMenuFlyout = (state: RootState) => state.ui.menuFlyout;
export const selectThemePreset = (state: RootState) => state.ui.themePreset;
export const selectCustomTheme = (state: RootState) => state.ui.customTheme;

export default uiSlice.reducer;
