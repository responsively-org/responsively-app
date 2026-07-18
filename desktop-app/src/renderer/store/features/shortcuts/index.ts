import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  resolveShortcutBindings,
  SHORTCUT_CHANNEL,
  ShortcutBindings,
  ShortcutChannel,
  ShortcutOverrides,
} from 'renderer/components/KeyboardShortcutsManager/constants';
import type {RootState} from '../..';

const SHORTCUTS_STORE_KEY = 'userPreferences.shortcuts';

const isShortcutChannel = (value: string): value is ShortcutChannel =>
  Object.values(SHORTCUT_CHANNEL).includes(value as ShortcutChannel);

const loadPersistedShortcutOverrides = (): ShortcutOverrides => {
  try {
    const persisted = window.electron.store.get(SHORTCUTS_STORE_KEY);
    if (persisted == null || typeof persisted !== 'object') {
      return {};
    }

    return Object.entries(persisted as Record<string, unknown>).reduce(
      (overrides, [channel, keys]) => {
        if (
          !isShortcutChannel(channel) ||
          !Array.isArray(keys) ||
          keys.some((key) => typeof key !== 'string')
        ) {
          return overrides;
        }

        overrides[channel] = keys;
        return overrides;
      },
      {} as ShortcutOverrides
    );
  } catch {
    return {};
  }
};

const persistShortcutOverrides = (overrides: ShortcutOverrides) => {
  window.electron.store.set(SHORTCUTS_STORE_KEY, overrides);
};

const initialState: ShortcutOverrides = loadPersistedShortcutOverrides();

export const shortcutsSlice = createSlice({
  name: 'shortcuts',
  initialState,
  reducers: {
    setShortcutOverride: (
      state,
      action: PayloadAction<{
        channel: ShortcutChannel;
        keys: string[];
      }>
    ) => {
      state[action.payload.channel] = action.payload.keys;
      persistShortcutOverrides({
        ...state,
        [action.payload.channel]: action.payload.keys,
      });
    },
    clearShortcutOverride: (state, action: PayloadAction<ShortcutChannel>) => {
      delete state[action.payload];

      const nextOverrides = {...state};
      delete nextOverrides[action.payload];
      persistShortcutOverrides(nextOverrides);
    },
  },
});

export const {setShortcutOverride, clearShortcutOverride} = shortcutsSlice.actions;

export const selectShortcutOverrides = (state: RootState) => state.shortcuts;
export const selectResolvedShortcutBindings = createSelector(
  [selectShortcutOverrides],
  (overrides): ShortcutBindings => resolveShortcutBindings(overrides)
);
export const selectShortcutOverride =
  (channel: ShortcutChannel) =>
  (state: RootState): string[] | undefined =>
    state.shortcuts[channel];

export default shortcutsSlice.reducer;
