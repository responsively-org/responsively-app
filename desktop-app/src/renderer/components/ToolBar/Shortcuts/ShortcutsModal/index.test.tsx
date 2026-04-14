import {configureStore} from '@reduxjs/toolkit';
import {fireEvent, render, screen} from '@testing-library/react';
import {type ReactNode} from 'react';
import {Provider} from 'react-redux';
import {type Mock} from 'vitest';
import shortcutsReducer from 'renderer/store/features/shortcuts';
import {SHORTCUT_CHANNEL} from 'renderer/components/KeyboardShortcutsManager/constants';
import ShortcutsModal from './index';

vi.mock('renderer/components/Modal', () => ({
  default: ({isOpen, children}: {isOpen: boolean; children?: ReactNode}) =>
    isOpen ? <div>{children}</div> : null,
}));

beforeEach(() => {
  vi.clearAllMocks();
  (window.electron.store.get as Mock).mockImplementation((key: string) => {
    if (key === 'userPreferences.shortcuts') {
      return {};
    }
    return undefined;
  });
});

const createStore = () =>
  configureStore({
    reducer: {
      shortcuts: shortcutsReducer,
    },
  });

describe('ShortcutsModal', () => {
  it('captures and stores a custom shortcut for a supported action', () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <ShortcutsModal isOpen onClose={() => undefined} />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('shortcut-THEME-edit'));
    fireEvent.keyDown(screen.getByTestId('shortcut-THEME-capture'), {
      code: 'KeyY',
      key: 'y',
      ctrlKey: true,
      shiftKey: true,
    });

    expect(store.getState().shortcuts[SHORTCUT_CHANNEL.THEME]).toEqual(['mod+shift+y']);
    expect(window.electron.store.set).toHaveBeenCalledWith('userPreferences.shortcuts', {
      [SHORTCUT_CHANNEL.THEME]: ['mod+shift+y'],
    });
    expect(screen.getByTestId('shortcut-THEME-reset')).toBeInTheDocument();
  });

  it('resets a customized shortcut back to defaults', () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <ShortcutsModal isOpen onClose={() => undefined} />
      </Provider>
    );

    fireEvent.click(screen.getByTestId('shortcut-THEME-edit'));
    fireEvent.keyDown(screen.getByTestId('shortcut-THEME-capture'), {
      code: 'KeyY',
      key: 'y',
      ctrlKey: true,
      shiftKey: true,
    });
    fireEvent.click(screen.getByTestId('shortcut-THEME-reset'));

    expect(store.getState().shortcuts[SHORTCUT_CHANNEL.THEME]).toBeUndefined();
    expect(window.electron.store.set).toHaveBeenLastCalledWith('userPreferences.shortcuts', {});
  });

  it('keeps reload fixed and non-editable', () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <ShortcutsModal isOpen onClose={() => undefined} />
      </Provider>
    );

    expect(screen.queryByTestId('shortcut-RELOAD-edit')).not.toBeInTheDocument();
    expect(screen.getByText('Fixed')).toBeInTheDocument();
  });
});
