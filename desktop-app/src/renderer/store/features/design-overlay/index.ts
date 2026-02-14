import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';

export type DesignOverlayPosition = 'overlay' | 'side';

export interface DesignOverlayState {
  image: string;
  opacity: number;
  position: DesignOverlayPosition;
  enabled: boolean;
  fileName?: string;
}

export type ViewResolution = string;

const loadPersistedOverlays = (): {
  [key: ViewResolution]: DesignOverlayState;
} => {
  try {
    const overlays =
      window.electron.store.get('userPreferences.designOverlays') || {};
    return overlays as { [key: ViewResolution]: DesignOverlayState };
  } catch {
    return {};
  }
};

const initialState: { [key: ViewResolution]: DesignOverlayState } =
  loadPersistedOverlays();

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

      const overlays =
        window.electron.store.get('userPreferences.designOverlays') || {};
      overlays[action.payload.resolution] = action.payload.overlayState;
      window.electron.store.set('userPreferences.designOverlays', overlays);
    },
    removeDesignOverlay: (
      state,
      action: PayloadAction<{
        resolution: ViewResolution;
      }>
    ) => {
      delete state[action.payload.resolution];

      const overlays =
        window.electron.store.get('userPreferences.designOverlays') || {};
      delete overlays[action.payload.resolution];
      window.electron.store.set('userPreferences.designOverlays', overlays);
    },
  },
});

export const { setDesignOverlay, removeDesignOverlay } =
  designOverlaySlice.actions;

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
