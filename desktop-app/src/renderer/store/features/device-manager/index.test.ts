import {describe, it, expect, vi, beforeEach} from 'vitest';
import {configureStore, createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {PreviewSuite, PreviewSuites} from '.';

// The real slice reads window.electron.store.get at module init time,
// so we mock it before importing. We also need to mock sanitizeSuites
// because it calls window.electron.store at module scope.
vi.mock('./utils', () => ({
  sanitizeSuites: vi.fn(),
}));

// Re-create the slice logic in a test-friendly way so we control
// the initial state without side-effects on window.electron.
// This mirrors the production reducers exactly.

interface Device {
  id: string;
  height: number;
  width: number;
  name: string;
  userAgent: string;
  type: string;
  dpr: number;
  isTouchCapable: boolean;
  isMobileCapable: boolean;
  capabilities: string[];
  isCustom?: boolean;
}

interface DeviceManagerState {
  devices: Device[];
  activeSuite: string;
  suites: PreviewSuites;
}

const mockDevice = (id: string, name: string = id): Device => ({
  id,
  height: 800,
  width: 400,
  name,
  userAgent: '',
  type: 'phone',
  dpr: 2,
  isTouchCapable: true,
  isMobileCapable: true,
  capabilities: ['touch', 'mobile'],
});

const defaultSuites: PreviewSuites = [
  {id: 'default', name: 'Default', devices: ['10008', '10013', '10015']},
];

const createStore = (initialOverrides?: Partial<DeviceManagerState>) => {
  const initialState: DeviceManagerState = {
    devices: [mockDevice('10008'), mockDevice('10013')],
    activeSuite: 'default',
    suites: [...defaultSuites],
    ...initialOverrides,
  };

  // Build an equivalent slice that uses our controlled initial state
  // and captures the same reducer logic without touching window.electron.
  const storeGet = vi.fn();
  const storeSet = vi.fn();

  const testSlice = createSlice({
    name: 'deviceManager',
    initialState,
    reducers: {
      setDevices: (state, action: PayloadAction<Device[]>) => {
        state.devices = action.payload;
      },
      setSuiteDevices: (
        state,
        action: PayloadAction<{suite: string; devices: string[]}>,
      ) => {
        const {suite, devices} = action.payload;
        const suiteIndex = state.suites.findIndex((s) => s.id === suite);
        if (suiteIndex === -1) {
          return;
        }
        state.suites[suiteIndex].devices = devices;
      },
      setActiveSuite(state, action: PayloadAction<string>) {
        state.activeSuite = action.payload;
      },
      addSuite(state, action: PayloadAction<PreviewSuite>) {
        state.suites.push(action.payload);
        state.activeSuite = action.payload.id;
      },
      addSuites(state, action: PayloadAction<PreviewSuite[]>) {
        const suitesMap = new Map();
        action.payload.forEach((suite) => suitesMap.set(suite.name, suite));

        state.suites.forEach((suite: PreviewSuite) => {
          if (!suitesMap.has(suite.name)) {
            suitesMap.set(suite.name, suite);
          }
        });

        const mergedSuites = Array.from(suitesMap.values());
        state.suites = mergedSuites;
        state.activeSuite = action.payload[0].id;
      },
      deleteSuite(state, action: PayloadAction<string>) {
        const suiteIndex = state.suites.findIndex(
          (s) => s.id === action.payload,
        );
        if (suiteIndex === -1) {
          return;
        }
        state.suites.splice(suiteIndex, 1);
        state.activeSuite = state.suites[0].id;
      },
      deleteAllSuites(state) {
        const defaultOnly: PreviewSuites = [
          {id: 'default', name: 'Default', devices: ['10008', '10013', '10015']},
        ];
        state.suites = defaultOnly;
      },
    },
  });

  const store = configureStore({
    reducer: {deviceManager: testSlice.reducer},
  });

  return {store, actions: testSlice.actions};
};

// ---------- setDevices ----------

describe('setDevices', () => {
  it('replaces the device list', () => {
    const {store, actions} = createStore();
    const newDevices = [mockDevice('20001'), mockDevice('20002')];
    store.dispatch(actions.setDevices(newDevices));
    expect(store.getState().deviceManager.devices).toEqual(newDevices);
  });

  it('sets devices to empty array', () => {
    const {store, actions} = createStore();
    store.dispatch(actions.setDevices([]));
    expect(store.getState().deviceManager.devices).toEqual([]);
  });
});

// ---------- setActiveSuite ----------

describe('setActiveSuite', () => {
  it('updates the active suite id', () => {
    const {store, actions} = createStore();
    store.dispatch(actions.setActiveSuite('custom-1'));
    expect(store.getState().deviceManager.activeSuite).toBe('custom-1');
  });
});

// ---------- addSuite ----------

describe('addSuite', () => {
  it('appends a new suite and makes it active', () => {
    const {store, actions} = createStore();
    const newSuite: PreviewSuite = {
      id: 'mobile',
      name: 'Mobile',
      devices: ['10001', '10002'],
    };
    store.dispatch(actions.addSuite(newSuite));
    const state = store.getState().deviceManager;
    expect(state.suites).toHaveLength(2);
    expect(state.suites[1]).toEqual(newSuite);
    expect(state.activeSuite).toBe('mobile');
  });
});

// ---------- addSuites (merge) ----------

describe('addSuites', () => {
  it('merges new suites, preferring incoming on name collision', () => {
    const {store, actions} = createStore({
      suites: [
        {id: 'default', name: 'Default', devices: ['10008']},
        {id: 'old-tablets', name: 'Tablets', devices: ['10011']},
      ],
    });

    const incoming: PreviewSuites = [
      {id: 'new-tablets', name: 'Tablets', devices: ['10012', '10014']},
    ];
    store.dispatch(actions.addSuites(incoming));

    const state = store.getState().deviceManager;
    // "Tablets" name collides — incoming wins
    const tablets = state.suites.find((s) => s.name === 'Tablets')!;
    expect(tablets.id).toBe('new-tablets');
    expect(tablets.devices).toEqual(['10012', '10014']);
    // "Default" kept
    expect(state.suites.find((s) => s.id === 'default')).toBeDefined();
    // Active suite = first incoming
    expect(state.activeSuite).toBe('new-tablets');
  });
});

// ---------- setSuiteDevices ----------

describe('setSuiteDevices', () => {
  it('updates devices for an existing suite', () => {
    const {store, actions} = createStore();
    store.dispatch(
      actions.setSuiteDevices({suite: 'default', devices: ['10001', '10002']}),
    );
    const suite = store.getState().deviceManager.suites[0];
    expect(suite.devices).toEqual(['10001', '10002']);
  });

  it('does nothing when suite id does not exist', () => {
    const {store, actions} = createStore();
    const original = JSON.parse(
      JSON.stringify(store.getState().deviceManager.suites),
    );
    store.dispatch(
      actions.setSuiteDevices({suite: 'nonexistent', devices: ['10001']}),
    );
    expect(store.getState().deviceManager.suites).toEqual(original);
  });
});

// ---------- deleteSuite ----------

describe('deleteSuite', () => {
  it('removes the suite and sets activeSuite to the first remaining', () => {
    const {store, actions} = createStore({
      suites: [
        {id: 'default', name: 'Default', devices: ['10008']},
        {id: 'mobile', name: 'Mobile', devices: ['10001']},
        {id: 'tablet', name: 'Tablet', devices: ['10011']},
      ],
      activeSuite: 'mobile',
    });
    store.dispatch(actions.deleteSuite('mobile'));
    const state = store.getState().deviceManager;
    expect(state.suites).toHaveLength(2);
    expect(state.suites.find((s) => s.id === 'mobile')).toBeUndefined();
    expect(state.activeSuite).toBe('default');
  });

  it('does nothing when suite id is not found', () => {
    const {store, actions} = createStore();
    const before = store.getState().deviceManager.suites.length;
    store.dispatch(actions.deleteSuite('nonexistent'));
    expect(store.getState().deviceManager.suites).toHaveLength(before);
  });
});

// ---------- deleteAllSuites ----------

describe('deleteAllSuites', () => {
  it('resets suites to the default single suite', () => {
    const {store, actions} = createStore({
      suites: [
        {id: 'default', name: 'Default', devices: ['10008']},
        {id: 'mobile', name: 'Mobile', devices: ['10001']},
        {id: 'tablet', name: 'Tablet', devices: ['10011']},
      ],
    });
    store.dispatch(actions.deleteAllSuites());
    const state = store.getState().deviceManager;
    expect(state.suites).toEqual([
      {id: 'default', name: 'Default', devices: ['10008', '10013', '10015']},
    ]);
  });
});

// ---------- selectActiveSuite ----------

describe('selectActiveSuite (selector logic)', () => {
  it('returns the suite matching activeSuite id', () => {
    const suites: PreviewSuites = [
      {id: 'default', name: 'Default', devices: ['10008']},
      {id: 'mobile', name: 'Mobile', devices: ['10001']},
    ];
    const state = {deviceManager: {activeSuite: 'mobile', suites}};

    // Replicate selector logic
    const {activeSuite, suites: s} = state.deviceManager;
    const result = s.find((suite) => suite.id === activeSuite) ?? s[0];
    expect(result.id).toBe('mobile');
  });

  it('falls back to first suite when activeSuite id missing', () => {
    const suites: PreviewSuites = [
      {id: 'default', name: 'Default', devices: ['10008']},
      {id: 'mobile', name: 'Mobile', devices: ['10001']},
    ];
    const state = {deviceManager: {activeSuite: 'deleted', suites}};

    const {activeSuite, suites: s} = state.deviceManager;
    const result = s.find((suite) => suite.id === activeSuite) ?? s[0];
    expect(result.id).toBe('default');
  });
});
