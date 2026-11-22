import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getDevicesMap} from 'common/deviceList';
import type {
  McpAppState,
  McpCaptureTargetsResult,
  McpDeviceInfo,
  McpSetDeviceOptionsResult,
} from 'common/mcp';
import {createAppStore} from 'renderer/store';
import {
  getEffectiveDeviceViewport,
  setIndividualRotation,
} from 'renderer/store/features/device-manager';
import {applyEventMirroring} from 'renderer/lib/event-mirroring';
import {applyDeviceColorScheme} from 'renderer/lib/device-color-scheme';
import {setAddressFromDevice} from 'renderer/store/features/renderer';
import {executeMcpCommand} from './commands';

vi.mock('renderer/lib/event-mirroring', () => ({applyEventMirroring: vi.fn()}));
vi.mock('renderer/lib/device-color-scheme', () => ({applyDeviceColorScheme: vi.fn()}));

describe('MCP device controls', () => {
  let store: ReturnType<typeof createAppStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(applyEventMirroring).mockResolvedValue(undefined);
    vi.mocked(applyDeviceColorScheme).mockResolvedValue(undefined);
    store = createAppStore();
    document.body.innerHTML = '';
    for (const [index, id] of ['10008', '10013', '10015'].entries()) {
      const device = getDevicesMap()[id];
      const viewport = () =>
        getEffectiveDeviceViewport(
          device,
          store.getState().renderer.rotate,
          store.getState().deviceManager.individualRotations[id],
          store.getState().deviceManager.viewportOverrides[id]
        );
      const element = document.createElement('div');
      element.id = device.name;
      Object.defineProperties(element, {
        offsetWidth: {get: () => viewport().width, configurable: true},
        offsetHeight: {get: () => viewport().height, configurable: true},
        executeJavaScript: {value: vi.fn(async () => viewport())},
        getWebContentsId: {value: () => index + 1},
        getURL: {value: () => 'https://example.com', configurable: true},
        isLoading: {value: () => false},
        getTitle: {value: () => 'Test page'},
      });
      document.body.appendChild(element);
    }
  });

  it.each([
    {},
    {reset: false},
    {width: 0},
    {height: 10001},
    {width: 1.5},
    {orientation: 'sideways'},
    {colorScheme: 'sepia'},
    {width: 500, reset: 'yes'},
    {device: 'missing', width: 500},
    {device: 'iPhone 4', width: 500},
  ])('rejects invalid options without changing session settings: %j', async (options) => {
    const before = store.getState();
    await expect(executeMcpCommand(store, 'set-device-options', options)).rejects.toThrow();
    expect(store.getState()).toBe(before);
    expect(applyDeviceColorScheme).not.toHaveBeenCalled();
  });

  it('keeps partial options, reports actual geometry, and leaves the catalog and other previews unchanged', async () => {
    const before = (await executeMcpCommand(store, 'get-app-state', {})) as McpAppState;
    await executeMcpCommand(store, 'set-device-options', {
      width: 500,
      height: 900,
      colorScheme: 'dark',
    });
    const rotated = (await executeMcpCommand(store, 'set-device-options', {
      orientation: 'landscape',
    })) as McpSetDeviceOptionsResult;
    expect(rotated.device).toMatchObject({width: 900, height: 500, colorScheme: 'dark'});
    const resized = (await executeMcpCommand(store, 'set-device-options', {
      width: 1000,
    })) as McpSetDeviceOptionsResult;
    expect(resized.device).toMatchObject({width: 1000, height: 500, colorScheme: 'dark'});
    const schemeOnly = (await executeMcpCommand(store, 'set-device-options', {
      colorScheme: 'light',
    })) as McpSetDeviceOptionsResult;
    expect(schemeOnly.device).toMatchObject({
      width: 1000,
      height: 500,
      orientation: 'landscape',
      colorScheme: 'light',
    });
    const state = (await executeMcpCommand(store, 'get-app-state', {})) as McpAppState;
    expect(state.activeDevices.slice(1)).toEqual(before.activeDevices.slice(1));
    const catalog = (await executeMcpCommand(store, 'list-devices', {})) as McpDeviceInfo[];
    expect(catalog.find((device) => device.id === '10008')).toMatchObject({
      width: 390,
      height: 844,
    });
    const captures = (await executeMcpCommand(
      store,
      'get-capture-targets',
      {}
    )) as McpCaptureTargetsResult;
    expect(captures.targets[0]).toMatchObject({width: 1000, height: 500});
    expect(window.electron.store.set).not.toHaveBeenCalled();
  });

  it('reports UI rotation and resets individual geometry and theme', async () => {
    store.dispatch(setIndividualRotation({id: '10013', rotated: true}));
    const state = (await executeMcpCommand(store, 'get-app-state', {})) as McpAppState;
    expect(state.activeDevices[1]).toMatchObject({
      width: 1024,
      height: 768,
      orientation: 'landscape',
    });
    await executeMcpCommand(store, 'set-device-options', {
      device: 'iPad',
      width: 1200,
      colorScheme: 'dark',
    });
    const reset = (await executeMcpCommand(store, 'set-device-options', {
      device: '10013',
      reset: true,
    })) as McpSetDeviceOptionsResult;
    expect(reset.device).toMatchObject({
      width: 768,
      height: 1024,
      orientation: 'portrait',
      colorScheme: 'system',
    });
    expect(store.getState().deviceManager.viewportOverrides['10013']).toBeUndefined();
  });

  it('saves hidden preview geometry without claiming the guest has resized', async () => {
    const hidden = document.getElementById('iPad')!;
    Object.defineProperties(hidden, {
      offsetWidth: {value: 0},
      offsetHeight: {value: 0},
    });
    hidden.style.width = '600px';
    hidden.style.height = '900px';
    const result = (await executeMcpCommand(store, 'set-device-options', {
      device: 'iPad',
      width: 600,
      height: 900,
      colorScheme: 'dark',
    })) as McpSetDeviceOptionsResult;
    expect(result).toMatchObject({
      device: {width: 600, height: 900, colorScheme: 'dark'},
      viewportApplied: false,
    });
    expect(applyDeviceColorScheme).toHaveBeenCalledExactlyOnceWith(hidden, 'dark');
    const captures = (await executeMcpCommand(store, 'get-capture-targets', {
      device: 'iPad',
    })) as McpCaptureTargetsResult;
    expect(captures.targets).toEqual([]);
    expect(captures.skipped[0].reason).toContain('hidden');
  });

  it('sets mirroring for one device or all active devices', async () => {
    await executeMcpCommand(store, 'set-mirroring', {device: 'iPad', enabled: false});
    expect(applyEventMirroring).toHaveBeenCalledExactlyOnceWith(
      document.getElementById('iPad'),
      false
    );
    let state = (await executeMcpCommand(store, 'get-app-state', {})) as McpAppState;
    expect(state.activeDevices.map((device) => device.mirroringEnabled)).toEqual([
      true,
      false,
      true,
    ]);
    await executeMcpCommand(store, 'set-mirroring', {enabled: false});
    state = (await executeMcpCommand(store, 'get-app-state', {})) as McpAppState;
    expect(state.activeDevices.every((device) => !device.mirroringEnabled)).toBe(true);
    expect(window.electron.store.set).not.toHaveBeenCalled();
  });

  it('validates all mirroring targets before applying changes and reports guest failures', async () => {
    await expect(executeMcpCommand(store, 'set-mirroring', {enabled: 'no'})).rejects.toThrow(
      'boolean'
    );
    await expect(
      executeMcpCommand(store, 'set-mirroring', {device: 'missing', enabled: false})
    ).rejects.toThrow('Unknown device');
    vi.mocked(applyEventMirroring).mockRejectedValueOnce(new Error('Socket not connected'));
    await expect(
      executeMcpCommand(store, 'set-mirroring', {device: 'iPad', enabled: false})
    ).rejects.toThrow('iPad: Socket not connected');
    document.getElementById('iPad')!.remove();
    vi.mocked(applyEventMirroring).mockClear();
    const before = store.getState();
    await expect(executeMcpCommand(store, 'set-mirroring', {enabled: true})).rejects.toThrow(
      'not mounted'
    );
    expect(store.getState()).toBe(before);
    expect(applyEventMirroring).not.toHaveBeenCalled();
  });

  it('explicit navigation waits for a divergent preview even when the primary URL is unchanged', async () => {
    const url = 'https://example.com';
    store.dispatch(setAddressFromDevice({url, deviceId: '10008', mirroringEnabled: false}));
    const preview = document.getElementById('iPad')!;
    let currentUrl = 'https://example.com/isolated';
    Object.defineProperty(preview, 'getURL', {value: () => currentUrl});
    let complete = false;
    const navigation = executeMcpCommand(store, 'navigate', {url}).then((result) => {
      complete = true;
      return result;
    });
    // A stop from its old page must not complete the newly requested load.
    preview.dispatchEvent(new Event('did-stop-loading'));
    await Promise.resolve();
    expect(complete).toBe(false);
    expect(store.getState().renderer.addressSource).toBeNull();
    preview.dispatchEvent(
      Object.assign(new Event('did-start-navigation'), {url: `${url}/`, isMainFrame: true})
    );
    currentUrl = url;
    preview.dispatchEvent(new Event('did-stop-loading'));
    await expect(navigation).resolves.toEqual({url, pageTitle: 'Test page', loaded: true});
  });
});
