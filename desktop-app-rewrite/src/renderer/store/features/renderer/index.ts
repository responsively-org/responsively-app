import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';

export interface RendererState {
  address: string;
  zoomFactor: number;
}

const zoomSteps = [
  0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2,
];

const initialState: RendererState = {
  address: 'https://google.com',
  zoomFactor: zoomSteps[4],
};

export const rendererSlice = createSlice({
  name: 'renderer',
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<string>) => {
      console.log('setAddress reducer', action.payload);
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
  },
});

// Action creators are generated for each case reducer function
export const { setAddress, zoomIn, zoomOut } = rendererSlice.actions;

export const selectZoomFactor = (state: RootState) => state.renderer.zoomFactor;

export default rendererSlice.reducer;
