import {describe, expect, it} from 'vitest';
import reducer, {
  addSuite,
  addSuites,
  deleteAllSuites,
  deleteSuite,
  selectActiveSuite,
  setActiveSuite,
  setSuiteDevices,
  DEFAULT_SUITE,
  DeviceManagerState,
  PreviewSuite,
} from './index';

const stateWith = (overrides: Partial<DeviceManagerState>): DeviceManagerState => ({
  devices: [],
  activeSuite: DEFAULT_SUITE.id,
  suites: [DEFAULT_SUITE],
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
});
