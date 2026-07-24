import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getDevicesMap} from 'common/deviceList';
import type {PreviewSuite} from './index';
import {freshImport, mockStoreData, storeSetMock} from '../sliceTestUtils';

type DeviceManagerModule = typeof import('./index');

const DEFAULT_SUITE: PreviewSuite = {
  id: 'default',
  name: 'Default',
  devices: ['10008', '10013', '10015'],
};

const loadSlice = async (overrides: Record<string, unknown> = {}): Promise<DeviceManagerModule> => {
  mockStoreData({
    'deviceManager.activeDevices': DEFAULT_SUITE.devices,
    'deviceManager.previewSuites': [DEFAULT_SUITE],
    'deviceManager.customDevices': [],
    ...overrides,
  });
  return freshImport(() => import('./index'));
};

describe('device-manager slice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes devices from persisted active device ids', async () => {
    const {default: reducer} = await loadSlice();
    const state = reducer(undefined, {type: '@@INIT'});
    expect(state.devices.map((device) => device.id)).toEqual(DEFAULT_SUITE.devices);
    expect(state.activeSuite).toBe('default');
    expect(state.suites).toEqual([DEFAULT_SUITE]);
  });

  it('setDevices persists the new active device ids', async () => {
    const {default: reducer, setDevices} = await loadSlice();
    const devicesMap = getDevicesMap();
    const next = [devicesMap['10008'], devicesMap['10013']];
    const state = reducer(undefined, setDevices(next));
    expect(state.devices).toEqual(next);
    expect(storeSetMock()).toHaveBeenCalledWith('deviceManager.activeDevices', ['10008', '10013']);
  });

  it('setSuiteDevices updates the matching suite and persists', async () => {
    const {default: reducer, setSuiteDevices} = await loadSlice();
    const state = reducer(
      undefined,
      setSuiteDevices({suite: 'default', devices: ['10008', '10013']})
    );
    expect(state.suites[0].devices).toEqual(['10008', '10013']);
    expect(storeSetMock()).toHaveBeenCalledWith('deviceManager.previewSuites', [
      {...DEFAULT_SUITE, devices: ['10008', '10013']},
    ]);
  });

  it('setSuiteDevices for an unknown suite is a no-op', async () => {
    const {default: reducer, setSuiteDevices} = await loadSlice();
    storeSetMock().mockClear();
    const state = reducer(undefined, setSuiteDevices({suite: 'nope', devices: ['10008']}));
    expect(state.suites).toEqual([DEFAULT_SUITE]);
    expect(storeSetMock()).not.toHaveBeenCalled();
  });

  it('addSuite appends, activates and persists the new suite', async () => {
    const {default: reducer, addSuite} = await loadSlice();
    const mobile: PreviewSuite = {id: 's2', name: 'Mobile', devices: ['10008']};
    const state = reducer(undefined, addSuite(mobile));
    expect(state.suites).toEqual([DEFAULT_SUITE, mobile]);
    expect(state.activeSuite).toBe('s2');
    expect(storeSetMock()).toHaveBeenCalledWith('deviceManager.previewSuites', [
      DEFAULT_SUITE,
      mobile,
    ]);
  });

  it('addSuites merges by name with imported suites winning', async () => {
    const {default: reducer, addSuites} = await loadSlice();
    const importedDefault: PreviewSuite = {id: 'imp1', name: 'Default', devices: ['10015']};
    const imported: PreviewSuite = {id: 'imp2', name: 'Imported', devices: ['10013']};
    const state = reducer(undefined, addSuites([importedDefault, imported]));
    expect(state.suites).toEqual([importedDefault, imported]);
    expect(state.activeSuite).toBe('imp1');
  });

  it('deleteSuite removes the suite and falls back to the first', async () => {
    const mobile: PreviewSuite = {id: 's2', name: 'Mobile', devices: ['10008']};
    const {default: reducer, deleteSuite} = await loadSlice({
      'deviceManager.previewSuites': [DEFAULT_SUITE, mobile],
    });
    const state = reducer(undefined, deleteSuite('s2'));
    expect(state.suites).toEqual([DEFAULT_SUITE]);
    expect(state.activeSuite).toBe('default');
  });

  it('deleteSuite with an unknown id is a no-op', async () => {
    const {default: reducer, deleteSuite} = await loadSlice();
    storeSetMock().mockClear();
    const state = reducer(undefined, deleteSuite('nope'));
    expect(state.suites).toEqual([DEFAULT_SUITE]);
    expect(storeSetMock()).not.toHaveBeenCalled();
  });

  it('deleteAllSuites resets to the default suite', async () => {
    const mobile: PreviewSuite = {id: 's2', name: 'Mobile', devices: ['10008']};
    const {default: reducer, deleteAllSuites} = await loadSlice({
      'deviceManager.previewSuites': [DEFAULT_SUITE, mobile],
    });
    const state = reducer(undefined, deleteAllSuites());
    expect(state.suites).toEqual([DEFAULT_SUITE]);
    expect(storeSetMock()).toHaveBeenCalledWith('deviceManager.previewSuites', [DEFAULT_SUITE]);
  });

  it('selectActiveSuite falls back to the first suite for unknown ids', async () => {
    const {selectActiveSuite} = await loadSlice();
    const state = {
      deviceManager: {devices: [], activeSuite: 'ghost', suites: [DEFAULT_SUITE]},
    };
    expect(selectActiveSuite(state as never)).toEqual(DEFAULT_SUITE);
  });
});
