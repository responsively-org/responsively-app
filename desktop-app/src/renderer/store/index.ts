import {combineReducers, configureStore} from '@reduxjs/toolkit';

import deviceManagerReducer from './features/device-manager';
import devtoolsReducer from './features/devtools';
import rendererReducer from './features/renderer';
import rulersReducer from './features/ruler';
import uiReducer from './features/ui';
import bookmarkReducer from './features/bookmarks';
import designOverlayReducer from './features/design-overlay';
import {persistenceMiddleware} from './persistence';
import {buildPreloadedState} from './preloadedState';

const rootReducer = combineReducers({
  renderer: rendererReducer,
  ui: uiReducer,
  deviceManager: deviceManagerReducer,
  devtools: devtoolsReducer,
  bookmarks: bookmarkReducer,
  rulers: rulersReducer,
  designOverlay: designOverlayReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/**
 * Store factory: persisted values arrive via preloadedState (read once at
 * bootstrap in preloadedState.ts) and are written back by the persistence
 * listener middleware — reducers are pure. Tests build isolated stores with
 * their own preloaded state through this same factory.
 */
export const createAppStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(persistenceMiddleware.middleware),
  });

export const store = createAppStore(buildPreloadedState());

export type AppDispatch = typeof store.dispatch;
