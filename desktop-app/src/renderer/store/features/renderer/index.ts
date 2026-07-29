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
}

const zoomSteps = [0.25, 0.33, 0.5, 0.55, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];

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
  individualZoomFactor: zoomSteps[window.electron.store.get('renderer.individualZoomStepIndex')],
  zoomFactor: zoomSteps[window.electron.store.get('renderer.zoomStepIndex')],
  rotate: false,
  isInspecting: undefined,
  layout: window.electron.store.get('ui.previewLayout'),
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
      const currentZoom =
        state.layout === PREVIEW_LAYOUTS.INDIVIDUAL ? state.individualZoomFactor : state.zoomFactor;
      const nextStep = zoomSteps.find((step) => step > currentZoom + 0.001); // +0.001 to handle floating point precision

      if (nextStep) {
        const newIndex = zoomSteps.indexOf(nextStep);
        if (state.layout === PREVIEW_LAYOUTS.INDIVIDUAL) {
          state.individualZoomFactor = nextStep;
          window.electron.store.set('renderer.individualZoomStepIndex', newIndex);
        } else {
          state.zoomFactor = nextStep;
          window.electron.store.set('renderer.zoomStepIndex', newIndex);
        }
      }
    },
    zoomOut: (state) => {
      const currentZoom =
        state.layout === PREVIEW_LAYOUTS.INDIVIDUAL ? state.individualZoomFactor : state.zoomFactor;
      const nextStep = [...zoomSteps].reverse().find((step) => step < currentZoom - 0.001);

      if (nextStep) {
        const newIndex = zoomSteps.indexOf(nextStep);
        if (state.layout === PREVIEW_LAYOUTS.INDIVIDUAL) {
          state.individualZoomFactor = nextStep;
          window.electron.store.set('renderer.individualZoomStepIndex', newIndex);
        } else {
          state.zoomFactor = nextStep;
          window.electron.store.set('renderer.zoomStepIndex', newIndex);
        }
      }
    },
    zoomBy: (state, action: PayloadAction<number>) => {
      const deltaY = action.payload;
      const MIN_ZOOM = zoomSteps[0];
      const MAX_ZOOM = zoomSteps[zoomSteps.length - 1];

      // Use an exponential scale so the perceived zoom speed is consistent across all zoom levels
      const multiplier = Math.exp(-deltaY * 0.002);

      if (state.layout === PREVIEW_LAYOUTS.INDIVIDUAL) {
        let newZoom = state.individualZoomFactor * multiplier;
        newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
        state.individualZoomFactor = newZoom;
      } else {
        let newZoom = state.zoomFactor * multiplier;
        newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
        state.zoomFactor = newZoom;
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
  },
});

// Action creators are generated for each case reducer function
export const {
  setAddress,
  zoomIn,
  zoomOut,
  zoomBy,
  setRotate,
  setIsInspecting,
  setLayout,
  setIsCapturingScreenshot,
  setPageTitle,
  setNotifications,
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

export default rendererSlice.reducer;
