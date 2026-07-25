import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {Mock} from 'vitest';
import {PREVIEW_LAYOUTS} from 'common/constants';
import {buildPreloadedState} from './preloadedState';
import {DEFAULT_SUITE} from './features/device-manager';

const mockStore = (data: Record<string, unknown>) => {
  (window.electron.store.get as Mock).mockImplementation((key: string) =>
    data[key] === undefined ? undefined : structuredClone(data[key])
  );
};

describe('buildPreloadedState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps persisted values into slice state', () => {
    mockStore({
      'ui.darkMode': false,
      homepage: 'https://home.example/',
      'renderer.zoomStepIndex': 9,
      'renderer.individualZoomStepIndex': 8,
      'ui.previewLayout': PREVIEW_LAYOUTS.COLUMN,
      'devtools.dockPosition': 'RIGHT',
      bookmarks: [{id: 'b1', name: 'One', address: 'https://one.com'}],
      'userPreferences.designOverlays': {},
      'deviceManager.previewSuites': [DEFAULT_SUITE],
      'deviceManager.activeDevices': ['10008', 'ghost-id'],
      'deviceManager.customDevices': [],
    });
    const state = buildPreloadedState();
    expect(state.ui.darkMode).toBe(false);
    expect(state.renderer.address).toBe('https://home.example/');
    expect(state.renderer.zoomFactor).toBe(1.1);
    expect(state.renderer.layout).toBe(PREVIEW_LAYOUTS.COLUMN);
    expect(state.devtools.dockPosition).toBe('RIGHT');
    expect(state.bookmarks.bookmarks).toHaveLength(1);
    expect(state.deviceManager.suites).toEqual([DEFAULT_SUITE]);
    // Unknown device ids are dropped instead of yielding undefined entries.
    expect(state.deviceManager.devices.map((d) => d.id)).toEqual(['10008']);
  });

  it('falls back to defaults for missing keys and writes back sanitized suites', () => {
    mockStore({'deviceManager.customDevices': []});
    const state = buildPreloadedState();
    expect(state.renderer.zoomFactor).toBe(1);
    expect(state.renderer.layout).toBe(PREVIEW_LAYOUTS.FLEX);
    expect(state.deviceManager.suites).toEqual([DEFAULT_SUITE]);
    expect(window.electron.store.set as Mock).toHaveBeenCalledWith('deviceManager.previewSuites', [
      DEFAULT_SUITE,
    ]);
  });

  it('sanitizes stale device ids out of persisted suites and persists the cleanup', () => {
    mockStore({
      'deviceManager.previewSuites': [
        {id: 'default', name: 'Default', devices: ['10008', 'deleted-custom-id']},
      ],
      'deviceManager.activeDevices': ['10008'],
      'deviceManager.customDevices': [],
    });
    const state = buildPreloadedState();
    expect(state.deviceManager.suites[0].devices).toEqual(['10008']);
    expect(window.electron.store.set as Mock).toHaveBeenCalledWith('deviceManager.previewSuites', [
      {id: 'default', name: 'Default', devices: ['10008']},
    ]);
  });
});
