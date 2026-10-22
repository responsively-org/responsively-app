import {configureStore} from '@reduxjs/toolkit';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {webViewPubSub} from 'renderer/lib/pubsub';
import rendererReducer, {setAddress} from 'renderer/store/features/renderer';
import AddressBar from '.';

vi.mock('./AuthModal', () => ({default: () => null}));
vi.mock('./SuggestionList', () => ({default: () => null}));
vi.mock('./BookmarkButton', () => ({default: () => null}));
vi.mock('./SitePermissions', () => ({default: () => null}));
vi.mock('./SiteToolsPopover', () => ({default: () => null}));
vi.mock('renderer/components/KeyboardShortcutsManager/useKeyboardShortcut', () => ({
  default: vi.fn(),
  SHORTCUT_CHANNEL: {},
}));

describe('Home navigation', () => {
  const renderAddressBar = (address = 'https://current.example/') => {
    const store = configureStore({reducer: {renderer: rendererReducer}});
    store.dispatch(setAddress(address));
    render(
      <Provider store={store}>
        <AddressBar />
      </Provider>
    );
    return store;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(window.electron.store.get).mockReturnValue('https://home.example/');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('opens the saved homepage without overwriting it or using an unfinished address', () => {
    const store = renderAddressBar();
    fireEvent.change(screen.getByTestId('address-bar'), {target: {value: 'unfinished draft'}});

    fireEvent.click(screen.getByRole('button', {name: 'Home'}));

    expect(store.getState().renderer.address).toBe('https://home.example/');
    expect(screen.getByTestId('address-bar')).toHaveValue('https://home.example/');
    expect(window.electron.store.set).not.toHaveBeenCalled();
    expect(screen.getByRole('button', {name: 'Home'})).not.toHaveAttribute('aria-pressed');
  });

  it('uses a homepage changed in settings since the toolbar mounted', () => {
    const store = renderAddressBar();
    vi.mocked(window.electron.store.get).mockReturnValue('localhost:3000/start');

    fireEvent.click(screen.getByRole('button', {name: 'Home'}));

    expect(store.getState().renderer.address).toBe('http://localhost:3000/start');
    expect(window.electron.store.set).not.toHaveBeenCalled();
  });

  it('requests a fresh homepage navigation when already home and restores the address field', () => {
    const navigate = vi.spyOn(webViewPubSub, 'publish');
    renderAddressBar('https://home.example/');
    fireEvent.change(screen.getByTestId('address-bar'), {target: {value: 'unfinished draft'}});

    fireEvent.click(screen.getByRole('button', {name: 'Home'}));

    expect(navigate).toHaveBeenCalledWith('home', 'https://home.example/');
    expect(screen.getByTestId('address-bar')).toHaveValue('https://home.example/');
    expect(window.electron.store.set).not.toHaveBeenCalled();
  });

  it('opens a local file homepage', () => {
    vi.mocked(window.electron.store.get).mockReturnValue('file:///tmp/home.html');
    const store = renderAddressBar();

    fireEvent.click(screen.getByRole('button', {name: 'Home'}));

    expect(store.getState().renderer.address).toBe('file:///tmp/home.html');
  });
});
