import {beforeEach, describe, expect, it, vi} from 'vitest';
import {freshImport, mockStoreData, storeSetMock} from '../sliceTestUtils';

type UiModule = typeof import('./index');

const loadSlice = async (darkMode = false): Promise<UiModule> => {
  mockStoreData({'ui.darkMode': darkMode});
  return freshImport(() => import('./index'));
};

describe('ui slice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes darkMode from the persisted store', async () => {
    const {default: reducer} = await loadSlice(true);
    const state = reducer(undefined, {type: '@@INIT'});
    expect(state.darkMode).toBe(true);
    expect(state.appView).toBe('BROWSER');
    expect(state.menuFlyout).toBe(false);
  });

  it('setDarkMode updates state and persists', async () => {
    const {default: reducer, setDarkMode} = await loadSlice(false);
    const state = reducer(undefined, setDarkMode(true));
    expect(state.darkMode).toBe(true);
    expect(storeSetMock()).toHaveBeenCalledWith('ui.darkMode', true);
  });

  it('setAppView switches views without persisting', async () => {
    const {default: reducer, setAppView, APP_VIEWS} = await loadSlice();
    storeSetMock().mockClear();
    const state = reducer(undefined, setAppView(APP_VIEWS.DEVICE_MANAGER));
    expect(state.appView).toBe('DEVICE_MANAGER');
    expect(storeSetMock()).not.toHaveBeenCalled();
  });

  it('closeMenuFlyout sets the flyout flag', async () => {
    const {default: reducer, closeMenuFlyout} = await loadSlice();
    const state = reducer(undefined, closeMenuFlyout(true));
    expect(state.menuFlyout).toBe(true);
  });
});
