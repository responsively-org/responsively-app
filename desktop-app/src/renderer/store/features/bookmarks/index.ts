import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';

export interface IBookmarks {
  name: string;
  address: string;
}
export interface BookmarksState {
  bookmarks: IBookmarks[];
}

const initialState: BookmarksState = {
  bookmarks: window.electron.store.get('bookmarks'),
};

export const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark: (state, action: PayloadAction<IBookmarks>) => {
      state.bookmarks = [...state.bookmarks, action.payload];
      window.electron.store.set('bookmarks', action.payload);
    },
    removeBookmark: (state, action: PayloadAction<IBookmarks>) => {
      const bookmarks: IBookmarks[] = window.electron.store.get('bookmarks');
      const filteredBookmark = bookmarks.filter(
        (bookmark) => bookmark.address !== action.payload.address
      );
      state.bookmarks = filteredBookmark;
      window.electron.store.set('bookmarks', filteredBookmark);
    },
  },
});

// Action creators are generated for each case reducer function
export const { addBookmark, removeBookmark } = bookmarksSlice.actions;

export const selectBookmarks = (state: RootState) => state.bookmarks.bookmarks;

export default bookmarksSlice.reducer;
