import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  IPC_MAIN_CHANNELS,
  Notification,
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
  notifications: Notification[] | null;
}

// 더 세분화된 줌 단계 (0.25배 ~ 3.0배, 총 56단계)
const zoomSteps = [
  // 축소 영역 (0.25 ~ 0.95, 0.05 간격)
  0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9,
  0.95,
  // 정상 영역 (1.0 ~ 1.5, 0.05 간격)
  1.0, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5,
  // 확대 영역 (1.55 ~ 3.0, 0.1 간격)
  1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0,
];

const urlFromQueryParam = () => {
  const params = new URLSearchParams(window.location.search);
  const url = params.get('urlToOpen');
  if (url !== 'undefined') {
    return url;
  }
  return undefined;
};

const getInitialZoomFactor = (
  key: 'renderer.individualZoomStepIndex' | 'renderer.zoomStepIndex'
): number => {
  const savedIndex = window.electron.store.get(key);
  // 저장된 인덱스가 유효한 범위 내에 있는지 확인
  if (
    typeof savedIndex === 'number' &&
    savedIndex >= 0 &&
    savedIndex < zoomSteps.length
  ) {
    return zoomSteps[savedIndex];
  }
  // 유효하지 않으면 기본값(1.0) 반환
  const defaultIndex = zoomSteps.indexOf(1.0);
  return defaultIndex >= 0
    ? zoomSteps[defaultIndex]
    : zoomSteps[Math.floor(zoomSteps.length / 2)];
};

const initialState: RendererState = {
  address: urlFromQueryParam() ?? window.electron.store.get('homepage'),
  pageTitle: '',
  individualZoomFactor: getInitialZoomFactor(
    'renderer.individualZoomStepIndex'
  ),
  zoomFactor: getInitialZoomFactor('renderer.zoomStepIndex'),
  rotate: false,
  isInspecting: undefined,
  layout: window.electron.store.get('ui.previewLayout'),
  isCapturingScreenshot: false,
  notifications: null,
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
      const index =
        state.layout === PREVIEW_LAYOUTS.INDIVIDUAL
          ? zoomSteps.indexOf(state.individualZoomFactor)
          : zoomSteps.indexOf(state.zoomFactor);

      // 현재 값이 배열에 없으면 가장 가까운 값을 찾음
      let currentIndex = index;
      if (currentIndex === -1) {
        const currentZoom =
          state.layout === PREVIEW_LAYOUTS.INDIVIDUAL
            ? state.individualZoomFactor
            : state.zoomFactor;
        // 가장 가까운 큰 값을 찾음
        currentIndex = zoomSteps.findIndex((step) => step > currentZoom);
        if (currentIndex === -1) currentIndex = zoomSteps.length - 1;
      }

      if (currentIndex < zoomSteps.length - 1) {
        if (state.layout === PREVIEW_LAYOUTS.INDIVIDUAL) {
          const newIndex = currentIndex + 1;
          state.individualZoomFactor = zoomSteps[newIndex];
          window.electron.store.set(
            'renderer.individualZoomStepIndex',
            newIndex
          );
        } else {
          const newIndex = currentIndex + 1;
          state.zoomFactor = zoomSteps[newIndex];
          window.electron.store.set('renderer.zoomStepIndex', newIndex);
        }
      }
    },
    zoomOut: (state) => {
      const index =
        state.layout === PREVIEW_LAYOUTS.INDIVIDUAL
          ? zoomSteps.indexOf(state.individualZoomFactor)
          : zoomSteps.indexOf(state.zoomFactor);

      // 현재 값이 배열에 없으면 가장 가까운 값을 찾음
      let currentIndex = index;
      if (currentIndex === -1) {
        const currentZoom =
          state.layout === PREVIEW_LAYOUTS.INDIVIDUAL
            ? state.individualZoomFactor
            : state.zoomFactor;
        // 가장 가까운 작은 값을 찾음
        for (let i = zoomSteps.length - 1; i >= 0; i -= 1) {
          if (zoomSteps[i] < currentZoom) {
            currentIndex = i;
            break;
          }
        }
        if (currentIndex === -1) currentIndex = 0;
      }

      if (currentIndex > 0) {
        if (state.layout === PREVIEW_LAYOUTS.INDIVIDUAL) {
          const newIndex = currentIndex - 1;
          state.individualZoomFactor = zoomSteps[newIndex];
          window.electron.store.set(
            'renderer.individualZoomStepIndex',
            newIndex
          );
        } else {
          const newIndex = currentIndex - 1;
          state.zoomFactor = zoomSteps[newIndex];
          window.electron.store.set('renderer.zoomStepIndex', newIndex);
        }
      }
    },
    // 직접 줌 값을 설정하는 액션 추가 (슬라이더용)
    setZoomFactor: (state, action: PayloadAction<number>) => {
      const zoomValue = Math.max(0.25, Math.min(3.0, action.payload));

      // 가장 가까운 단계 값을 찾음
      let closestIndex = 0;
      let minDiff = Math.abs(zoomSteps[0] - zoomValue);

      for (let i = 1; i < zoomSteps.length; i += 1) {
        const diff = Math.abs(zoomSteps[i] - zoomValue);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }

      if (state.layout === PREVIEW_LAYOUTS.INDIVIDUAL) {
        state.individualZoomFactor = zoomSteps[closestIndex];
        window.electron.store.set(
          'renderer.individualZoomStepIndex',
          closestIndex
        );
      } else {
        state.zoomFactor = zoomSteps[closestIndex];
        window.electron.store.set('renderer.zoomStepIndex', closestIndex);
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
  setZoomFactor,
  setRotate,
  setIsInspecting,
  setLayout,
  setIsCapturingScreenshot,
  setPageTitle,
  setNotifications,
} = rendererSlice.actions;

// zoomSteps를 외부에서 사용할 수 있도록 export
export { zoomSteps };

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
export const selectNotifications = (state: RootState) =>
  state.renderer.notifications;

export default rendererSlice.reducer;
