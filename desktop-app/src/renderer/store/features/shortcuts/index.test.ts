import {configureStore} from '@reduxjs/toolkit';
import {type Mock} from 'vitest';
import {
  SHORTCUT_CHANNEL,
  SHORTCUT_KEYS,
  resolveShortcutBindings,
} from 'renderer/components/KeyboardShortcutsManager/constants';
import shortcutsReducer, {
  clearShortcutOverride,
  selectResolvedShortcutBindings,
  setShortcutOverride,
} from './index';

const mockStore = {
  get: vi.fn(),
  set: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  (window.electron.store.get as Mock) = mockStore.get;
  (window.electron.store.set as Mock) = mockStore.set;
  mockStore.get.mockReturnValue({});
});

describe('shortcutsSlice', () => {
  const createStore = () =>
    configureStore({
      reducer: {
        shortcuts: shortcutsReducer,
      },
    });

  it('loads persisted overrides from electron store', async () => {
    vi.resetModules();
    mockStore.get.mockReturnValue({
      [SHORTCUT_CHANNEL.BOOKMARK]: ['mod+shift+b'],
    });

    const {default: reducer} = await import('./index');
    const store = configureStore({
      reducer: {
        shortcuts: reducer,
      },
    });

    expect(store.getState().shortcuts[SHORTCUT_CHANNEL.BOOKMARK]).toEqual(['mod+shift+b']);
  });

  it('persists a shortcut override', () => {
    const store = createStore();

    store.dispatch(
      setShortcutOverride({
        channel: SHORTCUT_CHANNEL.THEME,
        keys: ['mod+shift+y'],
      })
    );

    expect(store.getState().shortcuts[SHORTCUT_CHANNEL.THEME]).toEqual(['mod+shift+y']);
    expect(mockStore.set).toHaveBeenCalledWith('userPreferences.shortcuts', {
      [SHORTCUT_CHANNEL.THEME]: ['mod+shift+y'],
    });
  });

  it('clears a shortcut override and falls back to defaults', () => {
    const store = createStore();

    store.dispatch(
      setShortcutOverride({
        channel: SHORTCUT_CHANNEL.THEME,
        keys: ['mod+shift+y'],
      })
    );
    store.dispatch(clearShortcutOverride(SHORTCUT_CHANNEL.THEME));

    expect(store.getState().shortcuts[SHORTCUT_CHANNEL.THEME]).toBeUndefined();
    expect(mockStore.set).toHaveBeenLastCalledWith('userPreferences.shortcuts', {});
    expect(resolveShortcutBindings(store.getState().shortcuts)[SHORTCUT_CHANNEL.THEME]).toEqual(
      SHORTCUT_KEYS[SHORTCUT_CHANNEL.THEME]
    );
  });

  it('memoizes resolved shortcut bindings for unchanged state', () => {
    const state = {shortcuts: {}} as unknown as Parameters<
      typeof selectResolvedShortcutBindings
    >[0];

    expect(selectResolvedShortcutBindings(state)).toBe(selectResolvedShortcutBindings(state));
  });
});
