import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  IPC_MAIN_CHANNELS,
  PREVIEW_LAYOUTS,
  PreviewLayout,
} from 'common/constants';
import type { RootState } from '../..';

export interface RendererState {
  address: string;
  pageTitle: string;
  individualZoomFactor: number;
  zoomFactor: number;
  rotate: boolean;
  isInspecting: boolean | undefined;
  layout: PreviewLayout;
  isCapturingScreenshot: boolean;
}

const zoomSteps = [
  0.25, 0.33, 0.5, 0.55, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2,
];

const findNextZoomStep = (
  currentZoomFactor: number,
  direction: 'up' | 'down'
) => {
  if (direction !== 'up' && direction !== 'down') {
    // eslint-disable-next-line no-console
    console.error('Invalid direction specified');
    return currentZoomFactor;
  }

  const index = zoomSteps.findIndex((step) => step >= currentZoomFactor);

  if (direction === 'up') {
    // If the currentZoomFactor is exactly a predefined zoom step, move to the next zoom step.
    // If it's at or above the max zoom step, stay at the last step.

    if (index === -1 || currentZoomFactor === zoomSteps[zoomSteps.length - 1]) {
      return zoomSteps[zoomSteps.length - 1];
    }

    return currentZoomFactor === zoomSteps[index]
      ? zoomSteps[index + 1]
      : zoomSteps[index];
  }

  // direction === 'down'
  // if currentZoomFactor is at max, move two steps down, otherwise move one step down.
  return index === -1 ? zoomSteps[zoomSteps.length - 2] : zoomSteps[index - 1];
};

const urlFromQueryParam = () => {
  const params = new URLSearchParams(window.location.search);
  const url = params.get('urlToOpen');
  if (url !== 'undefined') {
    return url;
  }
  return undefined;
};

const initialState: RendererState = {
  address: urlFromQueryParam() ?? window.electron.store.get('homepage'),
  pageTitle: '',
  individualZoomFactor: window.electron.store.get(
    'renderer.individualZoomFactor'
  ),
  zoomFactor: window.electron.store.get('renderer.zoomFactor'),
  rotate: false,
  isInspecting: undefined,
  layout: window.electron.store.get('ui.previewLayout'),
  isCapturingScreenshot: false,
};

export const updateFileWatcher = (newURL: string) => {
  if (
    newURL.startsWith('file://') &&
    (newURL.endsWith('.html') || newURL.endsWith('.htm'))
  )
    window.electron.ipcRenderer.sendMessage(
      IPC_MAIN_CHANNELS.START_WATCHING_FILE,
      {
        path: newURL,
      }
    );
  else window.electron.ipcRenderer.sendMessage(IPC_MAIN_CHANNELS.STOP_WATCHER);
};

export const rendererSlice = createSlice({
  name: 'renderer',
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<string>) => {
      if (action.payload !== state.address) {
        updateFileWatcher(action.payload);
        state.address = action.payload;
      }
    },
    setPageTitle: (state, action: PayloadAction<string>) => {
      if (action.payload !== state.pageTitle) {
        state.pageTitle = action.payload;
      }
    },
    zoomIn: (state) => {
      const isIndividualLayout = state.layout === PREVIEW_LAYOUTS.INDIVIDUAL;
      const currentZoomFactorKey = isIndividualLayout
        ? 'individualZoomFactor'
        : 'zoomFactor';
      const currentZoomFactor = parseFloat(
        state[currentZoomFactorKey].toFixed(2)
      );
      const maxZoomFactor = zoomSteps[zoomSteps.length - 1];

      if (currentZoomFactor < maxZoomFactor) {
        const newZoomFactor = findNextZoomStep(currentZoomFactor, 'up');

        state[currentZoomFactorKey] = newZoomFactor;
        window.electron.store.set(
          `renderer.${currentZoomFactorKey}`,
          newZoomFactor
        );
      }
    },
    zoomOut: (state) => {
      const isIndividualLayout = state.layout === PREVIEW_LAYOUTS.INDIVIDUAL;
      const currentZoomFactorKey = isIndividualLayout
        ? 'individualZoomFactor'
        : 'zoomFactor';
      const currentZoomFactor = parseFloat(
        state[currentZoomFactorKey].toFixed(2)
      );
      const minZoomFactor = zoomSteps[0];

      if (currentZoomFactor > minZoomFactor) {
        const newZoomFactor = findNextZoomStep(currentZoomFactor, 'down');

        state[currentZoomFactorKey] = newZoomFactor;
        window.electron.store.set(
          `renderer.${currentZoomFactorKey}`,
          newZoomFactor
        );
      }
    },
    setZoomFactor: (state, action: PayloadAction<number>) => {
      const isIndividualLayout = state.layout === PREVIEW_LAYOUTS.INDIVIDUAL;
      const currentZoomFactorKey = isIndividualLayout
        ? 'individualZoomFactor'
        : 'zoomFactor';
      const maxZoomFactor = zoomSteps[zoomSteps.length - 1];
      const minZoomFactor = zoomSteps[0];
      const newZoomFactor = Math.min(
        Math.max(action.payload, minZoomFactor),
        maxZoomFactor
      );

      state[currentZoomFactorKey] = newZoomFactor;
      window.electron.store.set(
        `renderer.${currentZoomFactorKey}`,
        newZoomFactor
      );
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
    setIsCapturingScreenshot: (state, action: PayloadAction<boolean>) => {
      state.isCapturingScreenshot = action.payload;
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
  setIsCapturingScreenshot,
  setPageTitle,
  setZoomFactor,
} = rendererSlice.actions;

// Use different zoom factor based on state's current layout
export const selectZoomFactor = (state: RootState) => {
  if (state.renderer.layout === PREVIEW_LAYOUTS.INDIVIDUAL) {
    return state.renderer.individualZoomFactor;
  }
  return state.renderer.zoomFactor;
};

export const selectAddress = (state: RootState) => state.renderer.address;
export const selectPageTitle = (state: RootState) => state.renderer.pageTitle;
export const selectRotate = (state: RootState) => state.renderer.rotate;
export const selectIsInspecting = (state: RootState) =>
  state.renderer.isInspecting;
export const selectLayout = (state: RootState) => state.renderer.layout;
export const selectIsCapturingScreenshot = (state: RootState) =>
  state.renderer.isCapturingScreenshot;

export default rendererSlice.reducer;
