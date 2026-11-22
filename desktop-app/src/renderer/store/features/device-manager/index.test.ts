import {describe, expect, it} from 'vitest';
import {defaultDevices} from 'common/deviceList';
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
  setViewportOptions,
  getEffectiveDeviceViewport,
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
  viewportOverrides: {},
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

  it('merges session viewport options for one device without changing catalog or suites', () => {
    const before = stateWith({devices: defaultDevices.slice(0, 2)});
    let state = reducer(before, setViewportOptions({id: '10001', width: 640, colorScheme: 'dark'}));
    state = reducer(state, setViewportOptions({id: '10001', height: 960}));
    state = reducer(
      state,
      setViewportOptions({id: '10001', width: undefined, height: undefined, colorScheme: 'dark'})
    );
    state = reducer(state, setViewportOptions({id: '10002', colorScheme: 'light'}));
    expect(state.viewportOverrides).toEqual({
      '10001': {width: 640, height: 960, colorScheme: 'dark'},
      '10002': {colorScheme: 'light'},
    });
    expect(state.devices).toBe(before.devices);
    expect(state.suites).toBe(before.suites);
  });

  it('reset restores the preset and individual rotation, then applies any supplied options', () => {
    let state = reducer(undefined, setIndividualRotation({id: '10001', rotated: true}));
    state = reducer(state, setViewportOptions({id: '10001', width: 640, colorScheme: 'dark'}));
    state = reducer(state, setViewportOptions({id: '10002', width: 700}));
    state = reducer(state, setViewportOptions({id: '10001', reset: true}));
    expect(state.viewportOverrides).toEqual({'10002': {width: 700}});
    expect(state.individualRotations).toEqual({});
    state = reducer(state, setViewportOptions({id: '10002', reset: true, colorScheme: 'light'}));
    expect(state.viewportOverrides).toEqual({'10002': {colorScheme: 'light'}});
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

describe('effective device viewport', () => {
  const phone = {...defaultDevices[0], width: 390, height: 844};
  const desktop = {...phone, isMobileCapable: false, width: 1440, height: 900};

  it('retains existing global or individual rotation for presets', () => {
    expect(getEffectiveDeviceViewport(phone, true)).toEqual({
      width: 844,
      height: 390,
      orientation: 'landscape',
      isRotated: true,
    });
    expect(getEffectiveDeviceViewport(phone, false, true)).toEqual(
      getEffectiveDeviceViewport(phone, true, true)
    );
    expect(getEffectiveDeviceViewport(desktop, true, true)).toMatchObject({
      width: 1440,
      height: 900,
      isRotated: false,
    });
  });

  it('applies exact supplied dimensions even while global rotation is enabled', () => {
    expect(getEffectiveDeviceViewport(phone, true, true, {width: 720, height: 900})).toMatchObject({
      width: 720,
      height: 900,
      orientation: 'portrait',
      isRotated: false,
    });
    expect(getEffectiveDeviceViewport(phone, true, false, {width: 640})).toMatchObject({
      width: 640,
      height: 390,
    });
  });

  it('normalizes dimensions with an explicit orientation on phones and desktops', () => {
    expect(
      getEffectiveDeviceViewport(phone, false, false, {
        width: 640,
        height: 960,
        orientation: 'landscape',
      })
    ).toMatchObject({width: 960, height: 640, orientation: 'landscape', isRotated: true});
    expect(
      getEffectiveDeviceViewport(desktop, false, false, {orientation: 'portrait'})
    ).toMatchObject({width: 900, height: 1440, orientation: 'portrait', isRotated: true});
  });

  it('color-only overrides preserve rotation and squares are not rotated', () => {
    expect(getEffectiveDeviceViewport(phone, true, false, {colorScheme: 'dark'})).toEqual(
      getEffectiveDeviceViewport(phone, true)
    );
    expect(
      getEffectiveDeviceViewport(phone, false, false, {width: 600, height: 600})
    ).toMatchObject({width: 600, height: 600, isRotated: false});
  });
});
