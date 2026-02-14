import { configureStore } from '@reduxjs/toolkit';

import deviceManagerReducer from './features/device-manager';
import devtoolsReducer from './features/devtools';
import rendererReducer from './features/renderer';
import rulersReducer from './features/ruler';
import uiReducer from './features/ui';
import bookmarkReducer from './features/bookmarks';
import designOverlayReducer from './features/design-overlay';

export const store = configureStore({
  reducer: {
    renderer: rendererReducer,
    ui: uiReducer,
    deviceManager: deviceManagerReducer,
    devtools: devtoolsReducer,
    bookmarks: bookmarkReducer,
    rulers: rulersReducer,
    designOverlay: designOverlayReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
