import type Store from 'electron-store';

import {PREVIEW_LAYOUTS} from '../common/constants';
import {defaultDevices} from '../common/deviceList';
import {migrations} from './migrations';

type StoreState = {
  ui?: {
    previewlayout?: string;
    previewLayout?: string;
  };
  userPreferences?: {
    customTitlebar?: boolean;
    screenshot?: {saveLocation?: string};
  };
  deviceManager?: {
    customDevices?: Array<Record<string, unknown>>;
    activeDevices?: string[];
    previewSuites?: Array<{id: string; name: string; devices: string[]}>;
  };
};

const getValue = (state: StoreState, key: string) =>
  key.split('.').reduce<unknown>((current, segment) => {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, state);

const setValue = (state: StoreState, key: string, value: unknown) => {
  const segments = key.split('.');
  const lastSegment = segments.pop();

  if (lastSegment == null) {
    return;
  }

  let current: Record<string, unknown> = state as Record<string, unknown>;
  for (const segment of segments) {
    if (current[segment] == null || typeof current[segment] !== 'object') {
      current[segment] = {};
    }

    current = current[segment] as Record<string, unknown>;
  }

  current[lastSegment] = value;
};

const deleteValue = (state: StoreState, key: string) => {
  const segments = key.split('.');
  const lastSegment = segments.pop();

  if (lastSegment == null) {
    return;
  }

  let current: Record<string, unknown> | undefined = state as Record<string, unknown>;
  for (const segment of segments) {
    const next = current?.[segment];
    if (next == null || typeof next !== 'object') {
      return;
    }

    current = next as Record<string, unknown>;
  }

  delete current?.[lastSegment];
};

const createStoreMock = (state: StoreState) =>
  ({
    get: vi.fn((key: string) => getValue(state, key)),
    set: vi.fn((key: string, value: unknown) => setValue(state, key, value)),
    delete: vi.fn((key: string) => deleteValue(state, key)),
  }) as unknown as Store;

describe('migrations', () => {
  it('moves the legacy previewlayout value to previewLayout', () => {
    const state: StoreState = {
      ui: {
        previewlayout: PREVIEW_LAYOUTS.INDIVIDUAL,
      },
    };
    const store = createStoreMock(state);

    migrations['1.18.1'](store);

    expect(store.set).toHaveBeenCalledWith('ui.previewLayout', PREVIEW_LAYOUTS.INDIVIDUAL);
    expect(store.delete).toHaveBeenCalledWith('ui.previewlayout');
    expect(state.ui?.previewLayout).toBe(PREVIEW_LAYOUTS.INDIVIDUAL);
    expect(state.ui?.previewlayout).toBeUndefined();
  });

  it('keeps the new previewLayout value when both keys exist', () => {
    const state: StoreState = {
      ui: {
        previewlayout: PREVIEW_LAYOUTS.COLUMN,
        previewLayout: PREVIEW_LAYOUTS.MASONRY,
      },
    };
    const store = createStoreMock(state);

    migrations['1.18.1'](store);

    expect(store.set).not.toHaveBeenCalledWith('ui.previewLayout', PREVIEW_LAYOUTS.COLUMN);
    expect(store.delete).toHaveBeenCalledWith('ui.previewlayout');
    expect(state.ui?.previewLayout).toBe(PREVIEW_LAYOUTS.MASONRY);
    expect(state.ui?.previewlayout).toBeUndefined();
  });

  it('drops the orphaned customTitlebar preference', () => {
    const state: StoreState = {
      userPreferences: {
        customTitlebar: true,
        screenshot: {saveLocation: '/tmp/shots'},
      },
    };
    const store = createStoreMock(state);

    migrations['2.0.0'](store);

    expect(store.delete).toHaveBeenCalledWith('userPreferences.customTitlebar');
    expect(state.userPreferences?.customTitlebar).toBeUndefined();
    // Neighbouring preferences are untouched.
    expect(state.userPreferences?.screenshot?.saveLocation).toBe('/tmp/shots');
  });

  it('is a no-op when customTitlebar was never set', () => {
    const state: StoreState = {userPreferences: {screenshot: {saveLocation: '/tmp/shots'}}};
    const store = createStoreMock(state);

    migrations['2.0.0'](store);

    expect(store.delete).not.toHaveBeenCalled();
  });

  // conf runs every migration on a brand-new store (0.0.0 → current). The
  // legacy deviceManager migrations must stay silent no-ops there — a fresh
  // install used to log two "Migration failed" TypeErrors on first boot.
  it('1.2.0 is a silent no-op on a fresh store', () => {
    const store = createStoreMock({});
    const logSpy = vi.spyOn(console, 'log');

    migrations['1.2.0'](store);

    expect(store.set).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('1.14.0 is a silent no-op on a fresh store', () => {
    const store = createStoreMock({});
    const logSpy = vi.spyOn(console, 'log');

    migrations['1.14.0'](store);

    expect(store.set).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('1.2.0 still migrates legacy custom devices and active-device names', () => {
    const legacyDevice = defaultDevices[0];
    const state: StoreState = {
      deviceManager: {
        customDevices: [{name: 'My Device', width: 400, height: 800}],
        activeDevices: [legacyDevice.name],
      },
    };
    const store = createStoreMock(state);

    migrations['1.2.0'](store);

    expect(state.deviceManager?.customDevices?.[0].id).toEqual(expect.any(String));
    expect(state.deviceManager?.previewSuites).toEqual([
      {id: 'default', name: 'Default', devices: [legacyDevice.id]},
    ]);
  });

  it('1.14.0 still renames dpi to dpr on legacy custom devices', () => {
    const state: StoreState = {
      deviceManager: {
        customDevices: [{name: 'My Device', dpi: 2}],
      },
    };
    const store = createStoreMock(state);

    migrations['1.14.0'](store);

    expect(state.deviceManager?.customDevices?.[0].dpr).toBe(2);
    expect(state.deviceManager?.customDevices?.[0].dpi).toBeUndefined();
  });
});
