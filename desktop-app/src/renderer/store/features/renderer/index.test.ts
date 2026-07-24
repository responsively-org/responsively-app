import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {Mock} from 'vitest';
import {IPC_MAIN_CHANNELS, PREVIEW_LAYOUTS} from 'common/constants';
import {freshImport, mockStoreData, storeSetMock} from '../sliceTestUtils';

type RendererModule = typeof import('./index');

const HOMEPAGE = 'https://www.example.com/';

const loadSlice = async (overrides: Record<string, unknown> = {}): Promise<RendererModule> => {
  mockStoreData({
    homepage: HOMEPAGE,
    'renderer.zoomStepIndex': 8, // zoom 1
    'renderer.individualZoomStepIndex': 8,
    'ui.previewLayout': PREVIEW_LAYOUTS.FLEX,
    ...overrides,
  });
  return freshImport(() => import('./index'));
};

const sendMessageMock = () => window.electron.ipcRenderer.sendMessage as Mock;

describe('renderer slice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes address from the homepage and zoom from persisted steps', async () => {
    const {default: reducer} = await loadSlice();
    const state = reducer(undefined, {type: '@@INIT'});
    expect(state.address).toBe(HOMEPAGE);
    expect(state.zoomFactor).toBe(1);
    expect(state.individualZoomFactor).toBe(1);
    expect(state.layout).toBe(PREVIEW_LAYOUTS.FLEX);
  });

  it('setAddress updates the address and stops the file watcher for http urls', async () => {
    const {default: reducer, setAddress} = await loadSlice();
    const state = reducer(undefined, setAddress('https://other.com/'));
    expect(state.address).toBe('https://other.com/');
    expect(sendMessageMock()).toHaveBeenCalledWith(IPC_MAIN_CHANNELS.STOP_WATCHER);
  });

  it('setAddress starts the file watcher for local html files', async () => {
    const {default: reducer, setAddress} = await loadSlice();
    reducer(undefined, setAddress('file:///Users/dev/page.html'));
    expect(sendMessageMock()).toHaveBeenCalledWith(IPC_MAIN_CHANNELS.START_WATCHING_FILE, {
      path: 'file:///Users/dev/page.html',
    });
  });

  it('setAddress with the current address is a no-op', async () => {
    const {default: reducer, setAddress} = await loadSlice();
    sendMessageMock().mockClear();
    const state = reducer(undefined, setAddress(HOMEPAGE));
    expect(state.address).toBe(HOMEPAGE);
    expect(sendMessageMock()).not.toHaveBeenCalled();
  });

  it('zoomIn advances the shared zoom and persists the step index', async () => {
    const {default: reducer, zoomIn} = await loadSlice();
    const state = reducer(undefined, zoomIn());
    expect(state.zoomFactor).toBe(1.1);
    expect(storeSetMock()).toHaveBeenCalledWith('renderer.zoomStepIndex', 9);
  });

  it('zoomIn targets the individual zoom in INDIVIDUAL layout', async () => {
    const {default: reducer, zoomIn} = await loadSlice({
      'ui.previewLayout': PREVIEW_LAYOUTS.INDIVIDUAL,
    });
    const state = reducer(undefined, zoomIn());
    expect(state.individualZoomFactor).toBe(1.1);
    expect(state.zoomFactor).toBe(1);
    expect(storeSetMock()).toHaveBeenCalledWith('renderer.individualZoomStepIndex', 9);
  });

  it('zoomOut at the lowest step does not underflow', async () => {
    const {default: reducer, zoomOut} = await loadSlice({'renderer.zoomStepIndex': 0});
    storeSetMock().mockClear();
    const state = reducer(undefined, zoomOut());
    expect(state.zoomFactor).toBe(0.25);
    expect(storeSetMock()).not.toHaveBeenCalled();
  });

  it('setLayout updates and persists the layout', async () => {
    const {default: reducer, setLayout} = await loadSlice();
    const state = reducer(undefined, setLayout(PREVIEW_LAYOUTS.COLUMN));
    expect(state.layout).toBe(PREVIEW_LAYOUTS.COLUMN);
    expect(storeSetMock()).toHaveBeenCalledWith('ui.previewLayout', PREVIEW_LAYOUTS.COLUMN);
  });

  it('setNotifications appends only unseen notification ids', async () => {
    const {default: reducer, setNotifications} = await loadSlice();
    const first = reducer(undefined, setNotifications({id: 'n1', text: 'hello'}));
    const second = reducer(first, setNotifications({id: 'n1', text: 'hello again'}));
    expect(second.notifications).toHaveLength(1);
    expect(second.notifications?.[0].text).toBe('hello');
  });

  it('covers the simple flags', async () => {
    const {
      default: reducer,
      setRotate,
      setIsInspecting,
      setIsCapturingScreenshot,
      setPageTitle,
    } = await loadSlice();
    let state = reducer(undefined, setRotate(true));
    state = reducer(state, setIsInspecting(true));
    state = reducer(state, setIsCapturingScreenshot(true));
    state = reducer(state, setPageTitle('Title'));
    expect(state.rotate).toBe(true);
    expect(state.isInspecting).toBe(true);
    expect(state.isCapturingScreenshot).toBe(true);
    expect(state.pageTitle).toBe('Title');
  });
});
