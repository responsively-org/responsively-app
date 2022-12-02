import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { PreviewLayout } from 'common/constants';
import type { RootState } from '../..';

export interface RendererState {
  address: string;
  zoomFactor: number;
  rotate: boolean;
  isInspecting: boolean | undefined;
  layout: PreviewLayout;
}

const zoomSteps = [
  0.25, 0.33, 0.5, 0.55, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2,
];

const initialState: RendererState = {
  address: window.electron.store.get('homepage'),
  zoomFactor: zoomSteps[3],
  rotate: false,
  isInspecting: undefined,
  layout: window.electron.store.get('ui.previewLayout'),
};

export const rendererSlice = createSlice({
  name: 'renderer',
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<string>) => {
      if (action.payload !== state.address) {
        state.address = action.payload;
      }
    },
    zoomIn: (state) => {
      const index = zoomSteps.indexOf(state.zoomFactor);
      if (index < zoomSteps.length - 1) {
        state.zoomFactor = zoomSteps[index + 1];
      }
    },
    zoomOut: (state) => {
      const index = zoomSteps.indexOf(state.zoomFactor);
      if (index > 0) {
        state.zoomFactor = zoomSteps[index - 1];
      }
    },
    setRotate: (state, action: PayloadAction<boolean>) => {
      state.rotate = action.payload;
    },
    setIsInspecting: (state, action: PayloadAction<boolean>) => {
      state.isInspecting = action.payload;
    },
    setLayout: (state, action: PayloadAction<PreviewLayout>) => {
      state.layout = action.payload;
      window.electron.store.set('ui.previewLayout', action.payload);
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setAddress,
  zoomIn,
  zoomOut,
  setRotate,
  setIsInspecting,
  setLayout,
} = rendererSlice.actions;

export const selectZoomFactor = (state: RootState) => state.renderer.zoomFactor;
export const selectAddress = (state: RootState) => state.renderer.address;
export const selectRotate = (state: RootState) => state.renderer.rotate;
export const selectIsInspecting = (state: RootState) =>
  state.renderer.isInspecting;
export const selectLayout = (state: RootState) => state.renderer.layout;

export default rendererSlice.reducer;
