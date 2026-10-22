import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import {v4 as uuidv4} from 'uuid';
import type {RootState} from '../..';

export interface IBookmarks {
  id?: string;
  name: string;
  address: string;
}
export interface BookmarksState {
  bookmarks: IBookmarks[];
}

// Persisted values are injected via the store's preloaded state
// (store/preloadedState.ts); persistence happens in store/persistence.ts.
const initialState: BookmarksState = {
  bookmarks: [],
};

export const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark: {
      reducer: (state, action: PayloadAction<IBookmarks>) => {
        const index = state.bookmarks.findIndex((bookmark) => bookmark.id === action.payload.id);
        if (index === -1) {
          state.bookmarks.push(action.payload);
        } else {
          state.bookmarks[index] = action.payload;
        }
      },
      // Ids are assigned outside the reducer to keep it pure.
      prepare: (bookmark: IBookmarks) => ({
        payload: bookmark.id ? bookmark : {...bookmark, id: uuidv4()},
      }),
    },
    removeBookmark: (state, action: PayloadAction<{id?: string}>) => {
      const bookmarkIndex = state.bookmarks.findIndex(
        (bookmark) => bookmark.id === action.payload.id
      );
      if (bookmarkIndex === -1) {
        return;
      }
      state.bookmarks.splice(bookmarkIndex, 1);
    },
  },
});

// Action creators are generated for each case reducer function
export const {addBookmark, removeBookmark} = bookmarksSlice.actions;

export const selectBookmarks = (state: RootState) => state.bookmarks.bookmarks;

export default bookmarksSlice.reducer;
