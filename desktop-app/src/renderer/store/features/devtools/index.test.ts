import {beforeEach, describe, expect, it, vi} from 'vitest';
import {DOCK_POSITION} from 'common/constants';
import {freshImport, mockStoreData, storeSetMock} from '../sliceTestUtils';

type DevtoolsModule = typeof import('./index');
type DockPosition = import('./index').DockPosition;

const loadSlice = async (
  dockPosition: DockPosition = DOCK_POSITION.BOTTOM
): Promise<DevtoolsModule> => {
  mockStoreData({'devtools.dockPosition': dockPosition});
  return freshImport(() => import('./index'));
};

describe('devtools slice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes dockPosition from the persisted store', async () => {
    const {default: reducer} = await loadSlice(DOCK_POSITION.RIGHT);
    const state = reducer(undefined, {type: '@@INIT'});
    expect(state.dockPosition).toBe(DOCK_POSITION.RIGHT);
    expect(state.isOpen).toBe(false);
    expect(state.webViewId).toBe(-1);
  });

  it('setDevtoolsOpen records the webview id', async () => {
    const {default: reducer, setDevtoolsOpen} = await loadSlice();
    const state = reducer(undefined, setDevtoolsOpen(42));
    expect(state.isOpen).toBe(true);
    expect(state.webViewId).toBe(42);
  });

  it('setDevtoolsOpen is ignored while undocked', async () => {
    const {default: reducer, setDevtoolsOpen} = await loadSlice(DOCK_POSITION.UNDOCKED);
    const state = reducer(undefined, setDevtoolsOpen(42));
    expect(state.isOpen).toBe(false);
    expect(state.webViewId).toBe(-1);
  });

  it('setDevtoolsClose resets open state', async () => {
    const {default: reducer, setDevtoolsOpen, setDevtoolsClose} = await loadSlice();
    const opened = reducer(undefined, setDevtoolsOpen(42));
    const state = reducer(opened, setDevtoolsClose());
    expect(state.isOpen).toBe(false);
    expect(state.webViewId).toBe(-1);
  });

  it('setDockPosition updates state and persists', async () => {
    const {default: reducer, setDockPosition} = await loadSlice();
    const state = reducer(undefined, setDockPosition(DOCK_POSITION.RIGHT));
    expect(state.dockPosition).toBe(DOCK_POSITION.RIGHT);
    expect(storeSetMock()).toHaveBeenCalledWith('devtools.dockPosition', DOCK_POSITION.RIGHT);
  });

  it('setBounds stores the devtools bounds', async () => {
    const {default: reducer, setBounds} = await loadSlice();
    const bounds = {x: 1, y: 2, width: 300, height: 400};
    const state = reducer(undefined, setBounds(bounds));
    expect(state.bounds).toEqual(bounds);
  });
});
