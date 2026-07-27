import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import {HeaderRule} from 'common/headerRules';
import type {RootState} from '../..';

export interface HeaderRulesState {
  headerRules: HeaderRule[];
  isModalOpen: boolean;
}

const initialState: HeaderRulesState = {
  headerRules: window.electron.store.get('headerRules'),
  isModalOpen: false,
};

export const headerRulesSlice = createSlice({
  name: 'headerRules',
  initialState,
  reducers: {
    setHeaderRules: (state, action: PayloadAction<HeaderRule[]>) => {
      state.headerRules = action.payload;
      window.electron.store.set('headerRules', action.payload);
    },
    setHeaderRulesModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
  },
});

export const {setHeaderRules, setHeaderRulesModalOpen} = headerRulesSlice.actions;

export const selectHeaderRules = (state: RootState) => state.headerRules.headerRules;
export const selectIsHeaderRulesModalOpen = (state: RootState) => state.headerRules.isModalOpen;

export default headerRulesSlice.reducer;
