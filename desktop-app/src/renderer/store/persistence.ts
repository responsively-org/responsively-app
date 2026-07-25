import {createListenerMiddleware, isAnyOf} from '@reduxjs/toolkit';
import {PREVIEW_LAYOUTS} from 'common/constants';
import type {RootState} from '.';
import {addBookmark, removeBookmark} from './features/bookmarks';
import {removeDesignOverlay, setDesignOverlay} from './features/design-overlay';
import {
  addSuite,
  addSuites,
  deleteAllSuites,
  deleteSuite,
  setDevices,
  setSuiteDevices,
} from './features/device-manager';
import {setDockPosition} from './features/devtools';
import {
  setAddress,
  setLayout,
  updateFileWatcher,
  zoomIn,
  zoomOut,
  zoomSteps,
} from './features/renderer';
import {setDarkMode} from './features/ui';

/**
 * All electron-store persistence lives here as action listeners, keeping
 * reducers pure. Every write is key-scoped — writing one preference can never
 * clobber a sibling key (the historical cause of "theme resets when another
 * setting changes" bugs).
 */
export const persistenceMiddleware = createListenerMiddleware<RootState>();

const startListening = persistenceMiddleware.startListening;

startListening({
  actionCreator: setDarkMode,
  effect: (action) => {
    window.electron.store.set('ui.darkMode', action.payload);
  },
});

startListening({
  actionCreator: setDockPosition,
  effect: (action) => {
    window.electron.store.set('devtools.dockPosition', action.payload);
  },
});

startListening({
  matcher: isAnyOf(addBookmark, removeBookmark),
  effect: (_action, api) => {
    window.electron.store.set('bookmarks', api.getState().bookmarks.bookmarks);
  },
});

startListening({
  matcher: isAnyOf(setDesignOverlay, removeDesignOverlay),
  effect: (_action, api) => {
    window.electron.store.set('userPreferences.designOverlays', api.getState().designOverlay);
  },
});

startListening({
  actionCreator: setLayout,
  effect: (action) => {
    window.electron.store.set('ui.previewLayout', action.payload);
  },
});

startListening({
  matcher: isAnyOf(zoomIn, zoomOut),
  effect: (_action, api) => {
    const state = api.getState().renderer;
    const previous = api.getOriginalState().renderer;
    if (state.layout === PREVIEW_LAYOUTS.INDIVIDUAL) {
      if (state.individualZoomFactor !== previous.individualZoomFactor) {
        window.electron.store.set(
          'renderer.individualZoomStepIndex',
          zoomSteps.indexOf(state.individualZoomFactor)
        );
      }
    } else if (state.zoomFactor !== previous.zoomFactor) {
      window.electron.store.set('renderer.zoomStepIndex', zoomSteps.indexOf(state.zoomFactor));
    }
  },
});

startListening({
  actionCreator: setAddress,
  effect: (action, api) => {
    // Start/stop the local file watcher only on real address changes.
    if (api.getOriginalState().renderer.address !== api.getState().renderer.address) {
      updateFileWatcher(action.payload);
    }
  },
});

startListening({
  actionCreator: setDevices,
  effect: (action) => {
    window.electron.store.set(
      'deviceManager.activeDevices',
      action.payload.map((device) => device.id)
    );
  },
});

startListening({
  matcher: isAnyOf(setSuiteDevices, addSuite, addSuites, deleteSuite, deleteAllSuites),
  effect: (_action, api) => {
    window.electron.store.set('deviceManager.previewSuites', api.getState().deviceManager.suites);
  },
});
