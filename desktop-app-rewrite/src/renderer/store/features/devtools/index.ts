import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';

const defaultBounds = { x: 0, y: 0, width: 0, height: 0 };

export interface DevtoolsState {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isOpen: boolean;
}

const initialState: DevtoolsState = {
  bounds: defaultBounds,
  isOpen: false,
};

export const devtoolsSlice = createSlice({
  name: 'devtools',
  initialState,
  reducers: {
    setBounds: (state, action: PayloadAction<DevtoolsState['bounds']>) => {
      state.bounds = action.payload;
    },
    setIsOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setBounds, setIsOpen } = devtoolsSlice.actions;

export const selectIsDevtoolsOpen = (state: RootState) => state.devtools.isOpen;

export default devtoolsSlice.reducer;
