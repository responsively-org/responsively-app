import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';

const defaultBounds = { x: 0, y: 0, width: 0, height: 0 };

export const DOCK_POSITION = {
  BOTTOM: 'BOTTOM',
  RIGHT: 'RIGHT',
  UNDOCKED: 'UNDOCKED',
} as const;

export type DockPosition = typeof DOCK_POSITION[keyof typeof DOCK_POSITION];

export interface DevtoolsState {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isOpen: boolean;
  dockPosition: DockPosition;
}

const initialState: DevtoolsState = {
  bounds: defaultBounds,
  isOpen: false,
  dockPosition: DOCK_POSITION.RIGHT,
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
    setDockPosition: (state, action: PayloadAction<DockPosition>) => {
      state.dockPosition = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setBounds, setIsOpen, setDockPosition } = devtoolsSlice.actions;

export const selectIsDevtoolsOpen = (state: RootState) => state.devtools.isOpen;

export const selectDockPosition = (state: RootState) =>
  state.devtools.dockPosition;

export default devtoolsSlice.reducer;
