import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface RendererState {
  address: string;
}

const initialState: RendererState = {
  address: 'https://google.com',
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
  },
});

// Action creators are generated for each case reducer function
export const { setAddress } = rendererSlice.actions;

export default rendererSlice.reducer;
