import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '../..';

export type DesignOverlayPosition = 'overlay' | 'side';
export type DesignOverlayMode = 'grid' | 'image';

export interface DesignOverlayState {
  image: string;
  opacity: number;
  position: DesignOverlayPosition;
  enabled: boolean;
  fileName?: string;
  /** Absent on pre-2.0 persisted overlays — resolve via overlayModeOf(). */
  mode?: DesignOverlayMode;
}

/** Pre-mode overlays were always images; a mode-less entry without one is the grid. */
export const overlayModeOf = (overlay: DesignOverlayState): DesignOverlayMode =>
  overlay.mode ?? (overlay.image !== '' ? 'image' : 'grid');

export type ViewResolution = string;

// Persisted values are injected via the store's preloaded state
// (store/preloadedState.ts); persistence happens in store/persistence.ts.
const initialState: {[key: ViewResolution]: DesignOverlayState} = {};

export const designOverlaySlice = createSlice({
  name: 'designOverlay',
  initialState,
  reducers: {
    setDesignOverlay: (
      state,
      action: PayloadAction<{
        overlayState: DesignOverlayState;
        resolution: ViewResolution;
      }>
    ) => {
      state[action.payload.resolution] = action.payload.overlayState;
    },
    removeDesignOverlay: (
      state,
      action: PayloadAction<{
        resolution: ViewResolution;
      }>
    ) => {
      delete state[action.payload.resolution];
    },
    /** Quick toggle from the device pill; first use starts as the grid. */
    toggleDesignOverlay: (state, action: PayloadAction<{resolution: ViewResolution}>) => {
      const existing = state[action.payload.resolution];
      if (existing === undefined) {
        state[action.payload.resolution] = {
          image: '',
          opacity: 50,
          position: 'overlay',
          enabled: true,
          mode: 'grid',
        };
        return;
      }
      existing.enabled = !existing.enabled;
    },
    setOverlayMode: (
      state,
      action: PayloadAction<{resolution: ViewResolution; mode: DesignOverlayMode}>
    ) => {
      const existing = state[action.payload.resolution];
      if (existing !== undefined) {
        existing.mode = action.payload.mode;
      }
    },
    setOverlayOpacity: (
      state,
      action: PayloadAction<{resolution: ViewResolution; opacity: number}>
    ) => {
      const existing = state[action.payload.resolution];
      if (existing !== undefined) {
        existing.opacity = action.payload.opacity;
      }
    },
  },
});

export const {
  setDesignOverlay,
  removeDesignOverlay,
  toggleDesignOverlay,
  setOverlayMode,
  setOverlayOpacity,
} = designOverlaySlice.actions;

export const selectDesignOverlay =
  (state: RootState) =>
  (resolution: ViewResolution | undefined): DesignOverlayState | undefined => {
    if (resolution && state.designOverlay[resolution]) {
      return state.designOverlay[resolution];
    }
    return undefined;
  };

export const selectDesignOverlayEnabled =
  (state: RootState) => (resolution: ViewResolution | undefined) => {
    const overlay = selectDesignOverlay(state)(resolution);
    return overlay?.enabled ?? false;
  };

export default designOverlaySlice.reducer;
