import {describe, expect, it} from 'vitest';
import reducer, {
  addSuite,
  resetCanvasPositions,
  setCanvasPosition,
  addSuites,
  deleteAllSuites,
  deleteSuite,
  selectActiveSuite,
  setActiveSuite,
  setIndividualRotation,
  setSuiteDevices,
  DEFAULT_SUITE,
  DeviceManagerState,
  PreviewSuite,
} from './index';

const stateWith = (overrides: Partial<DeviceManagerState>): DeviceManagerState => ({
  devices: [],
  activeSuite: DEFAULT_SUITE.id,
  suites: [DEFAULT_SUITE],
  individualRotations: {},
  ...overrides,
});

const MOBILE: PreviewSuite = {id: 's2', name: 'Mobile', devices: ['10008']};

describe('device-manager slice', () => {
  it('defaults to the default suite', () => {
    const state = reducer(undefined, {type: '@@INIT'});
    expect(state.activeSuite).toBe('default');
    expect(state.suites).toEqual([DEFAULT_SUITE]);
  });

  it('setSuiteDevices updates the matching suite', () => {
    const state = reducer(undefined, setSuiteDevices({suite: 'default', devices: ['10008']}));
    expect(state.suites[0].devices).toEqual(['10008']);
  });

  it('setSuiteDevices for an unknown suite is a no-op', () => {
    const state = reducer(undefined, setSuiteDevices({suite: 'nope', devices: ['10008']}));
    expect(state.suites).toEqual([DEFAULT_SUITE]);
  });

  it('setActiveSuite switches the active suite', () => {
    const state = reducer(stateWith({suites: [DEFAULT_SUITE, MOBILE]}), setActiveSuite('s2'));
    expect(state.activeSuite).toBe('s2');
  });

  it('addSuite appends and activates the new suite', () => {
    const state = reducer(undefined, addSuite(MOBILE));
    expect(state.suites).toEqual([DEFAULT_SUITE, MOBILE]);
    expect(state.activeSuite).toBe('s2');
  });

  it('addSuites merges by name with imported suites winning', () => {
    const importedDefault: PreviewSuite = {id: 'imp1', name: 'Default', devices: ['10015']};
    const imported: PreviewSuite = {id: 'imp2', name: 'Imported', devices: ['10013']};
    const state = reducer(undefined, addSuites([importedDefault, imported]));
    expect(state.suites).toEqual([importedDefault, imported]);
    expect(state.activeSuite).toBe('imp1');
  });

  it('deleteSuite removes the suite and falls back to the first', () => {
    const state = reducer(
      stateWith({suites: [DEFAULT_SUITE, MOBILE], activeSuite: 's2'}),
      deleteSuite('s2')
    );
    expect(state.suites).toEqual([DEFAULT_SUITE]);
    expect(state.activeSuite).toBe('default');
  });

  it('deleteSuite with an unknown id is a no-op', () => {
    const state = reducer(undefined, deleteSuite('nope'));
    expect(state.suites).toEqual([DEFAULT_SUITE]);
  });

  it('deleteAllSuites resets to the default suite', () => {
    const state = reducer(stateWith({suites: [DEFAULT_SUITE, MOBILE]}), deleteAllSuites());
    expect(state.suites).toEqual([DEFAULT_SUITE]);
    expect(state.activeSuite).toBe('default');
  });

  it('selectActiveSuite falls back to the first suite for unknown ids', () => {
    const state = {
      deviceManager: stateWith({activeSuite: 'ghost'}),
    };
    expect(selectActiveSuite(state as never)).toEqual(DEFAULT_SUITE);
  });

  it('setIndividualRotation tracks per-device rotation', () => {
    let state = reducer(undefined, setIndividualRotation({id: '10008', rotated: true}));
    expect(state.individualRotations).toEqual({'10008': true});

    state = reducer(state, setIndividualRotation({id: '10013', rotated: true}));
    expect(state.individualRotations).toEqual({'10008': true, '10013': true});
  });

  it('setIndividualRotation removes the entry when un-rotated', () => {
    let state = reducer(undefined, setIndividualRotation({id: '10008', rotated: true}));
    state = reducer(state, setIndividualRotation({id: '10008', rotated: false}));
    expect(state.individualRotations).toEqual({});
  });

  it('setCanvasPosition stores per-device world positions on the suite', () => {
    let state = reducer(
      undefined,
      setCanvasPosition({suite: 'default', device: '10008', position: {x: 120, y: 40}})
    );
    state = reducer(
      state,
      setCanvasPosition({suite: 'default', device: '10013', position: {x: 600, y: 40}})
    );
    expect(state.suites[0].canvasPositions).toEqual({
      '10008': {x: 120, y: 40},
      '10013': {x: 600, y: 40},
    });

    // Unknown suite is a no-op.
    const untouched = reducer(
      state,
      setCanvasPosition({suite: 'ghost', device: '10008', position: {x: 0, y: 0}})
    );
    expect(untouched.suites).toEqual(state.suites);
  });

  it('resetCanvasPositions clears the arrangement', () => {
    let state = reducer(
      undefined,
      setCanvasPosition({suite: 'default', device: '10008', position: {x: 120, y: 40}})
    );
    state = reducer(state, resetCanvasPositions('default'));
    expect(state.suites[0].canvasPositions).toBeUndefined();
  });
});
