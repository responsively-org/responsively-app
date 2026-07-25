import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {Mock} from 'vitest';
import {IPC_MAIN_CHANNELS, PREVIEW_LAYOUTS} from 'common/constants';
import {createAppStore} from './index';
import {addBookmark, removeBookmark} from './features/bookmarks';
import {setDesignOverlay} from './features/design-overlay';
import {addSuite, deleteSuite, setSuiteDevices, DEFAULT_SUITE} from './features/device-manager';
import {setDockPosition} from './features/devtools';
import {setAddress, setLayout, zoomIn, zoomOut} from './features/renderer';
import {setDarkMode} from './features/ui';

const setMock = () => window.electron.store.set as Mock;
const sendMessageMock = () => window.electron.ipcRenderer.sendMessage as Mock;

describe('persistence middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists dark mode under its own key', () => {
    const store = createAppStore();
    store.dispatch(setDarkMode(false));
    expect(setMock()).toHaveBeenCalledWith('ui.darkMode', false);
    expect(setMock()).toHaveBeenCalledTimes(1);
  });

  it('persists dock position under its own key', () => {
    const store = createAppStore();
    store.dispatch(setDockPosition('RIGHT'));
    expect(setMock()).toHaveBeenCalledWith('devtools.dockPosition', 'RIGHT');
  });

  it('persists bookmarks on add and remove', () => {
    const store = createAppStore();
    store.dispatch(addBookmark({name: 'Docs', address: 'https://docs.com'}));
    const [bookmark] = store.getState().bookmarks.bookmarks;
    expect(setMock()).toHaveBeenCalledWith('bookmarks', [bookmark]);
    store.dispatch(removeBookmark({id: bookmark.id}));
    expect(setMock()).toHaveBeenLastCalledWith('bookmarks', []);
  });

  it('persists design overlays as a whole map', () => {
    const store = createAppStore();
    const overlayState = {image: 'x', opacity: 0.5, position: 'overlay' as const, enabled: true};
    store.dispatch(setDesignOverlay({resolution: '390x844', overlayState}));
    expect(setMock()).toHaveBeenCalledWith('userPreferences.designOverlays', {
      '390x844': overlayState,
    });
  });

  it('persists layout and zoom step under their own keys', () => {
    const store = createAppStore();
    store.dispatch(setLayout(PREVIEW_LAYOUTS.COLUMN));
    expect(setMock()).toHaveBeenCalledWith('ui.previewLayout', PREVIEW_LAYOUTS.COLUMN);
    store.dispatch(zoomIn());
    expect(setMock()).toHaveBeenCalledWith('renderer.zoomStepIndex', 9);
  });

  it('does not write zoom when already at the boundary', () => {
    const store = createAppStore();
    for (let i = 0; i < 20; i += 1) {
      store.dispatch(zoomOut());
    }
    setMock().mockClear();
    store.dispatch(zoomOut());
    expect(setMock()).not.toHaveBeenCalled();
  });

  it('drives the file watcher from address changes only', () => {
    const store = createAppStore();
    store.dispatch(setAddress('file:///Users/dev/page.html'));
    expect(sendMessageMock()).toHaveBeenCalledWith(IPC_MAIN_CHANNELS.START_WATCHING_FILE, {
      path: 'file:///Users/dev/page.html',
    });
    sendMessageMock().mockClear();
    store.dispatch(setAddress('file:///Users/dev/page.html'));
    expect(sendMessageMock()).not.toHaveBeenCalled();
    store.dispatch(setAddress('https://example.com/'));
    expect(sendMessageMock()).toHaveBeenCalledWith(IPC_MAIN_CHANNELS.STOP_WATCHER);
  });

  it('persists suites on every suite mutation', () => {
    const store = createAppStore();
    store.dispatch(setSuiteDevices({suite: 'default', devices: ['10008']}));
    expect(setMock()).toHaveBeenCalledWith('deviceManager.previewSuites', [
      {...DEFAULT_SUITE, devices: ['10008']},
    ]);
    store.dispatch(addSuite({id: 's2', name: 'Mobile', devices: ['10013']}));
    store.dispatch(deleteSuite('s2'));
    expect(setMock()).toHaveBeenLastCalledWith('deviceManager.previewSuites', [
      {...DEFAULT_SUITE, devices: ['10008']},
    ]);
  });
});
