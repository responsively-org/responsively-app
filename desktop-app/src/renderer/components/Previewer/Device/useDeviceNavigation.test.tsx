import {act, cleanup, renderHook} from '@testing-library/react';
import {IPC_MAIN_CHANNELS} from 'common/constants';
import {NAVIGATION_EVENTS} from 'renderer/components/ToolBar/NavigationControls';
import {webViewPubSub} from 'renderer/lib/pubsub';
import useDeviceNavigation from './useDeviceNavigation';

const {dispatch} = vi.hoisted(() => ({dispatch: vi.fn()}));
vi.mock('react-redux', () => ({useDispatch: () => dispatch}));
vi.mock('./utils', () => ({appendHistory: vi.fn()}));
vi.mock('renderer/components/ToolBar/AddressBar', () => ({
  ADDRESS_BAR_EVENTS: {
    DELETE_COOKIES: 'DELETE_COOKIES',
    DELETE_STORAGE: 'DELETE_STORAGE',
    DELETE_CACHE: 'DELETE_CACHE',
  },
}));

describe('Home preview navigation', () => {
  beforeEach(() => vi.clearAllMocks());
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
        useDeviceNavigation({ref, isPrimary, webviewReady: true, address: homepage})
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
