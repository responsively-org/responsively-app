import {act, cleanup, renderHook} from '@testing-library/react';
import {IPC_MAIN_CHANNELS} from 'common/constants';
import {NAVIGATION_EVENTS} from 'renderer/components/ToolBar/NavigationControls';
import {webViewPubSub} from 'renderer/lib/pubsub';
import type {RootState} from 'renderer/store';
import rendererReducer, {setAddress, setAddressFromDevice} from 'renderer/store/features/renderer';
import useDeviceNavigation from './useDeviceNavigation';

const {dispatch, selectState} = vi.hoisted(() => ({dispatch: vi.fn(), selectState: vi.fn()}));
vi.mock('react-redux', () => ({useDispatch: () => dispatch, useSelector: selectState}));
vi.mock('./utils', () => ({appendHistory: vi.fn()}));
vi.mock('renderer/components/ToolBar/AddressBar', () => ({
  ADDRESS_BAR_EVENTS: {
    DELETE_COOKIES: 'DELETE_COOKIES',
    DELETE_STORAGE: 'DELETE_STORAGE',
    DELETE_CACHE: 'DELETE_CACHE',
  },
}));

let state: RootState;
beforeEach(() => {
  vi.clearAllMocks();
  state = {
    renderer: rendererReducer(undefined, {type: '@@INIT'}),
    eventMirroring: {enabledByDevice: {}},
  } as RootState;
  selectState.mockImplementation((selector: (root: RootState) => unknown) => selector(state));
});

describe('Home preview navigation', () => {
  afterEach(cleanup);

  it.each([true, false])(
    'loads the configured homepage explicitly instead of reloading redirected content (primary: %s)',
    async (isPrimary) => {
      const homepage = 'https://home.example/';
      const webview = {
        getURL: vi.fn().mockReturnValue(homepage),
        getWebContentsId: vi.fn().mockReturnValue(42),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        reload: vi.fn(),
      };
      const ref = {current: webview as unknown as Electron.WebviewTag};
      renderHook(() =>
        useDeviceNavigation({
          ref,
          isPrimary,
          webviewReady: true,
          address: homepage,
          deviceId: 'phone',
        })
      );
      webview.getURL.mockReturnValue('https://home.example/redirected');

      await act(async () => {
        await webViewPubSub.publish(NAVIGATION_EVENTS.HOME, homepage);
      });

      expect(window.electron.ipcRenderer.invoke).toHaveBeenCalledExactlyOnceWith(
        IPC_MAIN_CHANNELS.LOAD_URL_IN_WEBVIEW,
        {webContentsId: 42, url: homepage}
      );
      expect(webview.reload).not.toHaveBeenCalled();
    }
  );
});

describe('event mirroring navigation isolation', () => {
  afterEach(cleanup);
  const initialAddress = 'https://example.com/';
  const nextAddress = 'https://example.com/next';

  const createWebview = (id: number) =>
    Object.assign(new EventTarget(), {
      getURL: vi.fn().mockReturnValue(initialAddress),
      getTitle: vi.fn().mockReturnValue('Example'),
      getWebContentsId: vi.fn().mockReturnValue(id),
    });

  it('keeps a disabled primary navigation local while still updating the address', () => {
    state.renderer = rendererReducer(state.renderer, setAddress(initialAddress));
    state.eventMirroring.enabledByDevice.primary = false;
    const primary = createWebview(1);
    const peer = createWebview(2);
    const primaryRef = {current: primary as unknown as Electron.WebviewTag};
    const peerRef = {current: peer as unknown as Electron.WebviewTag};
    const {rerender} = renderHook(() => {
      useDeviceNavigation({
        ref: primaryRef,
        isPrimary: true,
        webviewReady: true,
        address: state.renderer.address,
        deviceId: 'primary',
      });
      useDeviceNavigation({
        ref: peerRef,
        isPrimary: false,
        webviewReady: true,
        address: state.renderer.address,
        deviceId: 'peer',
      });
    });

    primary.getURL.mockReturnValue(nextAddress);
    act(() => {
      primary.dispatchEvent(Object.assign(new Event('did-navigate'), {url: nextAddress}));
    });
    const navigationAction = setAddressFromDevice({
      url: nextAddress,
      deviceId: 'primary',
      mirroringEnabled: false,
    });
    expect(dispatch).toHaveBeenCalledWith(navigationAction);
    state.renderer = rendererReducer(state.renderer, navigationAction);
    rerender();

    expect(state.renderer.address).toBe(nextAddress);
    expect(window.electron.ipcRenderer.invoke).not.toHaveBeenCalled();
  });

  it('skips disabled recipients and only reconciles them on explicit navigation', () => {
    state.renderer = rendererReducer(state.renderer, setAddress(initialAddress));
    state.eventMirroring.enabledByDevice.peer = false;
    const webview = createWebview(2);
    const ref = {current: webview as unknown as Electron.WebviewTag};
    const {rerender} = renderHook(() =>
      useDeviceNavigation({
        ref,
        isPrimary: false,
        webviewReady: true,
        address: state.renderer.address,
        deviceId: 'peer',
      })
    );

    state.renderer = rendererReducer(
      state.renderer,
      setAddressFromDevice({url: nextAddress, deviceId: 'primary', mirroringEnabled: true})
    );
    rerender();
    expect(window.electron.ipcRenderer.invoke).not.toHaveBeenCalled();

    // Enabling mirroring never resets the recipient to a previously skipped URL.
    state.eventMirroring.enabledByDevice.peer = true;
    rerender();
    expect(window.electron.ipcRenderer.invoke).not.toHaveBeenCalled();

    state.eventMirroring.enabledByDevice.peer = false;
    state.renderer = rendererReducer(state.renderer, setAddress(nextAddress));
    rerender();
    expect(window.electron.ipcRenderer.invoke).toHaveBeenCalledExactlyOnceWith(
      IPC_MAIN_CHANNELS.LOAD_URL_IN_WEBVIEW,
      {webContentsId: 2, url: nextAddress}
    );
  });

  it('mirrors primary navigation to enabled recipients', () => {
    state.renderer = rendererReducer(
      state.renderer,
      setAddressFromDevice({url: nextAddress, deviceId: 'primary', mirroringEnabled: true})
    );
    const webview = createWebview(2);
    renderHook(() =>
      useDeviceNavigation({
        ref: {current: webview as unknown as Electron.WebviewTag},
        isPrimary: false,
        webviewReady: true,
        address: state.renderer.address,
        deviceId: 'peer',
      })
    );
    expect(window.electron.ipcRenderer.invoke).toHaveBeenCalledExactlyOnceWith(
      IPC_MAIN_CHANNELS.LOAD_URL_IN_WEBVIEW,
      {webContentsId: 2, url: nextAddress}
    );
  });
});
