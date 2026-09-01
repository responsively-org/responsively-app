import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import {IPC_MAIN_CHANNELS, Notification, PREVIEW_LAYOUTS, PreviewLayout} from 'common/constants';
import type {RootState} from '../..';

export interface RendererState {
  address: string;
  pageTitle: string;
  individualZoomFactor: number;
  zoomFactor: number;
  rotate: boolean;
  isInspecting: boolean | undefined;
  layout: PreviewLayout;
  isCapturingScreenshot: boolean;
  notifications: Notification[] | null;
  canvasZoom: number;
  canvasOptions: CanvasOptions;
}

export const zoomSteps = [0.25, 0.33, 0.5, 0.55, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];

// Canvas world zoom (design: 0.25–1.25, default 0.9). Distinct from the
// per-device zoomFactor, which scales the devices themselves.
export const canvasZoomSteps = [0.25, 0.33, 0.5, 0.55, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25];

export interface CanvasOptions {
  /** Draw hardware-style bezels around canvas frames. */
  showBezels: boolean;
  showNames: boolean;
  showDims: boolean;
}
const DEFAULT_CANVAS_ZOOM = 0.9;
export const clampCanvasZoom = (value: number): number =>
  Math.min(canvasZoomSteps[canvasZoomSteps.length - 1], Math.max(canvasZoomSteps[0], value));

// Persisted values are injected via the store's preloaded state
// (store/preloadedState.ts); persistence and the file-watcher IPC happen in
// store/persistence.ts.
const initialState: RendererState = {
  address: '',
  pageTitle: '',
  individualZoomFactor: zoomSteps[8],
  zoomFactor: zoomSteps[8],
  canvasZoom: DEFAULT_CANVAS_ZOOM,
  canvasOptions: {showBezels: false, showNames: true, showDims: true},
  rotate: false,
  isInspecting: undefined,
  layout: PREVIEW_LAYOUTS.FLEX,
  isCapturingScreenshot: false,
  notifications: null,
};

export const updateFileWatcher = (newURL: string) => {
  if (newURL.startsWith('file://') && (newURL.endsWith('.html') || newURL.endsWith('.htm')))
    window.electron.ipcRenderer.sendMessage(IPC_MAIN_CHANNELS.START_WATCHING_FILE, {
      path: newURL,
    });
  else window.electron.ipcRenderer.sendMessage(IPC_MAIN_CHANNELS.STOP_WATCHER);
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
    setPageTitle: (state, action: PayloadAction<string>) => {
      if (action.payload !== state.pageTitle) {
        state.pageTitle = action.payload;
      }
    },
    zoomIn: (state) => {
      const index =
        state.layout === PREVIEW_LAYOUTS.INDIVIDUAL
          ? zoomSteps.indexOf(state.individualZoomFactor)
          : zoomSteps.indexOf(state.zoomFactor);

      if (index < zoomSteps.length - 1) {
        if (state.layout === PREVIEW_LAYOUTS.INDIVIDUAL) {
          state.individualZoomFactor = zoomSteps[index + 1];
        } else {
          state.zoomFactor = zoomSteps[index + 1];
        }
      }
    },
    zoomOut: (state) => {
      const index =
        state.layout === PREVIEW_LAYOUTS.INDIVIDUAL
          ? zoomSteps.indexOf(state.individualZoomFactor)
          : zoomSteps.indexOf(state.zoomFactor);
      if (index > 0) {
        if (state.layout === PREVIEW_LAYOUTS.INDIVIDUAL) {
          state.individualZoomFactor = zoomSteps[index - 1];
        } else {
          state.zoomFactor = zoomSteps[index - 1];
        }
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
    },
    setIsCapturingScreenshot: (state, action: PayloadAction<boolean>) => {
      state.isCapturingScreenshot = action.payload;
    },
    setNotifications: (state, action: PayloadAction<Notification>) => {
      const notifications = state.notifications || [];
      const index = notifications.findIndex(
        (notification: Notification) => notification.id === action.payload.id
      );

      if (index === -1) {
        state.notifications = [...notifications, action.payload];
      }
    },
    setCanvasZoom: (state, action: PayloadAction<number>) => {
      state.canvasZoom = clampCanvasZoom(action.payload);
    },
    canvasZoomIn: (state) => {
      const next = canvasZoomSteps.find((step) => step > state.canvasZoom);
      if (next !== undefined) {
        state.canvasZoom = next;
      }
    },
    toggleCanvasOption: (state, action: PayloadAction<keyof CanvasOptions>) => {
      state.canvasOptions[action.payload] = !state.canvasOptions[action.payload];
    },
    canvasZoomOut: (state) => {
      const next = [...canvasZoomSteps].reverse().find((step) => step < state.canvasZoom);
      if (next !== undefined) {
        state.canvasZoom = next;
      }
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
  setNotifications,
  setCanvasZoom,
  canvasZoomIn,
  canvasZoomOut,
  toggleCanvasOption,
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
export const selectIsInspecting = (state: RootState) => state.renderer.isInspecting;
export const selectLayout = (state: RootState) => state.renderer.layout;
export const selectIsCapturingScreenshot = (state: RootState) =>
  state.renderer.isCapturingScreenshot;
export const selectNotifications = (state: RootState) => state.renderer.notifications;
export const selectCanvasZoom = (state: RootState) => state.renderer.canvasZoom;
export const selectCanvasOptions = (state: RootState) => state.renderer.canvasOptions;

export default rendererSlice.reducer;
