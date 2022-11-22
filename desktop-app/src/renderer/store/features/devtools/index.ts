import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DOCK_POSITION } from 'common/constants';
import type { RootState } from '../..';

const defaultBounds = { x: 0, y: 0, width: 0, height: 0 };

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
  webViewId: number;
}

const initialState: DevtoolsState = {
  bounds: defaultBounds,
  isOpen: false,
  dockPosition: window.electron.store.get('devtools.dockPosition'),
  webViewId: -1,
};

export const devtoolsSlice = createSlice({
  name: 'devtools',
  initialState,
  reducers: {
    setBounds: (state, action: PayloadAction<DevtoolsState['bounds']>) => {
      state.bounds = action.payload;
    },
    setDevtoolsOpen: (state, action: PayloadAction<number>) => {
      if (state.dockPosition === DOCK_POSITION.UNDOCKED) {
        return;
      }
      state.isOpen = true;
      state.webViewId = action.payload;
    },
    setDevtoolsClose: (state) => {
      state.isOpen = false;
      state.webViewId = -1;
    },
    setDockPosition: (state, action: PayloadAction<DockPosition>) => {
      window.electron.store.set('devtools.dockPosition', action.payload);
      state.dockPosition = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setBounds, setDevtoolsOpen, setDevtoolsClose, setDockPosition } =
  devtoolsSlice.actions;

export const selectIsDevtoolsOpen = (state: RootState) => state.devtools.isOpen;

export const selectDevtoolsWebviewId = (state: RootState) =>
  state.devtools.webViewId;

export const selectDockPosition = (state: RootState) =>
  state.devtools.dockPosition;

export default devtoolsSlice.reducer;
