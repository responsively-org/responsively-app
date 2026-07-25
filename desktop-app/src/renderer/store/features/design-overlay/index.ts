import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '../..';

export type DesignOverlayPosition = 'overlay' | 'side';

export interface DesignOverlayState {
  image: string;
  opacity: number;
  position: DesignOverlayPosition;
  enabled: boolean;
  fileName?: string;
}

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
  },
});

export const {setDesignOverlay, removeDesignOverlay} = designOverlaySlice.actions;

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
