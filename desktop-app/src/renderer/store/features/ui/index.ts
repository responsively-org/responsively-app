import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '../..';

export const APP_VIEWS = {
  BROWSER: 'BROWSER',
  DEVICE_MANAGER: 'DEVICE_MANAGER',
} as const;

export type AppView = (typeof APP_VIEWS)[keyof typeof APP_VIEWS];

export interface UIState {
  darkMode: boolean;
  appView: AppView;
  menuFlyout: boolean;
  /** Present mode: chrome hidden, canvas full-bleed (session state). */
  isPresenting: boolean;
}

// Persisted values are injected via the store's preloaded state
// (store/preloadedState.ts); persistence happens in store/persistence.ts.
const initialState: UIState = {
  darkMode: true,
  appView: APP_VIEWS.BROWSER,
  menuFlyout: false,
  isPresenting: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    setAppView: (state, action: PayloadAction<AppView>) => {
      state.appView = action.payload;
    },
    closeMenuFlyout: (state, action: PayloadAction<boolean>) => {
      state.menuFlyout = action.payload;
    },
    setPresenting: (state, action: PayloadAction<boolean>) => {
      state.isPresenting = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {setDarkMode, setAppView, closeMenuFlyout, setPresenting} = uiSlice.actions;

export const selectDarkMode = (state: RootState) => state.ui.darkMode;
export const selectAppView = (state: RootState) => state.ui.appView;
export const selectMenuFlyout = (state: RootState) => state.ui.menuFlyout;
export const selectIsPresenting = (state: RootState) => state.ui.isPresenting;

export default uiSlice.reducer;
