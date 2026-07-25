import {describe, expect, it} from 'vitest';
import {DOCK_POSITION} from 'common/constants';
import reducer, {
  setBounds,
  setDevtoolsClose,
  setDevtoolsOpen,
  setDockPosition,
  DevtoolsState,
} from './index';

const stateWith = (overrides: Partial<DevtoolsState>): DevtoolsState => ({
  bounds: {x: 0, y: 0, width: 0, height: 0},
  isOpen: false,
  dockPosition: DOCK_POSITION.BOTTOM,
  webViewId: -1,
  ...overrides,
});

describe('devtools slice', () => {
  it('has pure defaults', () => {
    const state = reducer(undefined, {type: '@@INIT'});
    expect(state.dockPosition).toBe(DOCK_POSITION.BOTTOM);
    expect(state.isOpen).toBe(false);
    expect(state.webViewId).toBe(-1);
  });

  it('setDevtoolsOpen records the webview id', () => {
    const state = reducer(undefined, setDevtoolsOpen(42));
    expect(state.isOpen).toBe(true);
    expect(state.webViewId).toBe(42);
  });

  it('setDevtoolsOpen is ignored while undocked', () => {
    const state = reducer(stateWith({dockPosition: DOCK_POSITION.UNDOCKED}), setDevtoolsOpen(42));
    expect(state.isOpen).toBe(false);
    expect(state.webViewId).toBe(-1);
  });

  it('setDevtoolsClose resets open state', () => {
    const state = reducer(stateWith({isOpen: true, webViewId: 42}), setDevtoolsClose());
    expect(state.isOpen).toBe(false);
    expect(state.webViewId).toBe(-1);
  });

  it('setDockPosition updates state', () => {
    const state = reducer(undefined, setDockPosition(DOCK_POSITION.RIGHT));
    expect(state.dockPosition).toBe(DOCK_POSITION.RIGHT);
  });

  it('setBounds stores the devtools bounds', () => {
    const bounds = {x: 1, y: 2, width: 300, height: 400};
    const state = reducer(undefined, setBounds(bounds));
    expect(state.bounds).toEqual(bounds);
  });
});
