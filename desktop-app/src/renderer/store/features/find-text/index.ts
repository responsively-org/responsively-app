import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '../..';

export interface FindTextState {
  isOpen: boolean;
  searchText: string;
  matches: number;
  activeMatch: number;
}

const initialState: FindTextState = {
  isOpen: false,
  searchText: '',
  matches: 0,
  activeMatch: 0,
};

export const findTextSlice = createSlice({
  name: 'findText',
  initialState,
  reducers: {
    openFindBar: (state) => {
      state.isOpen = true;
    },
    closeFindBar: (state) => {
      state.isOpen = false;
      state.searchText = '';
      state.matches = 0;
      state.activeMatch = 0;
    },
    setSearchText: (state, action: PayloadAction<string>) => {
      state.searchText = action.payload;
      // Reset match info when search text changes
      if (action.payload === '') {
        state.matches = 0;
        state.activeMatch = 0;
      }
    },
    setMatchResult: (state, action: PayloadAction<{matches: number; activeMatch: number}>) => {
      state.matches = action.payload.matches;
      state.activeMatch = action.payload.activeMatch;
    },
    resetFind: (state) => {
      state.searchText = '';
      state.matches = 0;
      state.activeMatch = 0;
    },
  },
});

export const {openFindBar, closeFindBar, setSearchText, setMatchResult, resetFind} =
  findTextSlice.actions;

export const selectFindTextIsOpen = (state: RootState) => state.findText.isOpen;
export const selectFindTextSearchText = (state: RootState) => state.findText.searchText;
export const selectFindTextMatches = (state: RootState) => state.findText.matches;
export const selectFindTextActiveMatch = (state: RootState) => state.findText.activeMatch;

export default findTextSlice.reducer;
