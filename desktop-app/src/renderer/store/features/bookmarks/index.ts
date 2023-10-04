import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type { RootState } from '../..';

export interface IBookmarks {
  id?: string;
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
      const bookmarks: IBookmarks[] = window.electron.store.get('bookmarks');
      if (action.payload.id) {
        const index = bookmarks.findIndex(
          (bookmark) => bookmark.id === action.payload.id
        );
        bookmarks[index] = action.payload;
      } else {
        const updatedPayload = {
          ...action.payload,
          id: uuidv4(),
        };
        bookmarks.push(updatedPayload);
      }
      state.bookmarks = bookmarks;
      window.electron.store.set('bookmarks', bookmarks);
    },
    removeBookmark: (state, action) => {
      const bookmarks = window.electron.store.get('bookmarks');
      const bookmarkIndex = state.bookmarks.findIndex(
        (bookmark) => bookmark.id === action.payload.id
      );
      if (bookmarkIndex === -1) {
        return;
      }
      bookmarks.splice(bookmarkIndex, 1);
      state.bookmarks = bookmarks;
      window.electron.store.set('bookmarks', bookmarks);
    },
  },
});

// Action creators are generated for each case reducer function
export const { addBookmark, removeBookmark } = bookmarksSlice.actions;

export const selectBookmarks = (state: RootState) => state.bookmarks.bookmarks;

export default bookmarksSlice.reducer;
