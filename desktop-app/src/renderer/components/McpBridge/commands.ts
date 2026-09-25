import {IPC_MAIN_CHANNELS} from 'common/constants';
import {Device, getDevicesMap} from 'common/deviceList';
import {
  McpActiveDevice,
  McpAppState,
  McpBridgeCommand,
  McpCaptureTargetsPayload,
  McpCaptureTargetsResult,
  McpDeviceInfo,
  McpNavigatePayload,
  McpNavigateResult,
  McpSetActiveDevicesPayload,
  McpSetActiveDevicesResult,
  McpSetJavascriptEnabledPayload,
  McpSetJavascriptEnabledResult,
  McpSetNetworkScriptsBlockedPayload,
  McpSetNetworkScriptsBlockedResult,
} from 'common/mcp';
import {SetJavascriptEnabledArgs, SetJavascriptEnabledResult} from 'main/javascript-toggle';
import {
  SetNetworkScriptsBlockedArgs,
  SetNetworkScriptsBlockedResult,
} from 'main/network-script-blocker';
import {Store} from 'redux';
import {
  selectActiveSuite,
  setDeviceJavaScriptDisabled,
  setDeviceNetworkScriptsBlocked,
  setSuiteDevices,
} from 'renderer/store/features/device-manager';
import {selectZoomFactor, setAddress} from 'renderer/store/features/renderer';
import type {RootState} from '../../store';
import {resolveDeviceQuery} from './deviceQuery';
import {getRegisteredDeviceWebview} from './webviewRegistry';

type AppStore = Pick<Store<RootState>, 'getState' | 'dispatch'>;

const NAVIGATION_TIMEOUT_MS = 30_000;

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const toActiveDevice = (device: Device): McpActiveDevice => ({
  id: device.id,
  name: device.name,
  width: device.width,
  height: device.height,
  type: device.type,
});

const getActiveDevices = (state: RootState): Device[] => {
  const devicesMap = getDevicesMap();
  return selectActiveSuite(state)
    .devices.map((id) => devicesMap[id])
    .filter((device): device is Device => device !== undefined);
};

const getDeviceWebview = (deviceId: string): Electron.WebviewTag | null =>
  getRegisteredDeviceWebview(deviceId);

const getAppState = (state: RootState): McpAppState => ({
  url: state.renderer.address,
  pageTitle: state.renderer.pageTitle,
  layout: state.renderer.layout,
  zoomFactor: selectZoomFactor(state),
  activeSuite: selectActiveSuite(state).name,
  activeDevices: getActiveDevices(state).map(toActiveDevice),
});

const listDevices = (state: RootState): McpDeviceInfo[] => {
  const activeIds = new Set(selectActiveSuite(state).devices);
  return Object.values(getDevicesMap()).map((device) => ({
    ...toActiveDevice(device),
    isCustom: device.isCustom ?? false,
    isActive: activeIds.has(device.id),
  }));
};

const setActiveDevices = async (
  store: AppStore,
  payload: McpSetActiveDevicesPayload
): Promise<McpSetActiveDevicesResult> => {
  const queries = payload?.devices ?? [];
  if (queries.length === 0) {
    throw new Error('Provide at least one device id or name');
  }
  const devicesMap = getDevicesMap();
  const resolved: Device[] = [];
  const unmatched: string[] = [];
  queries.forEach((query) => {
    const device = resolveDeviceQuery(devicesMap, query);
    if (device === undefined) {
      unmatched.push(query);
    } else if (!resolved.some((d) => d.id === device.id)) {
      resolved.push(device);
    }
  });
  if (unmatched.length > 0) {
    throw new Error(
      `Unknown devices: ${unmatched.join(
        ', '
      )}. Use the list_devices tool to see valid ids and names.`
    );
  }
  const activeSuite = selectActiveSuite(store.getState());
  store.dispatch(
    setSuiteDevices({suite: activeSuite.id, devices: resolved.map((device) => device.id)})
  );
  // Give the new webviews a moment to mount before subsequent tool calls.
  await sleep(300);
  return {activeDevices: resolved.map(toActiveDevice)};
};

// Only means "the network-level load finished" — a page's own async-mounted
// content (a client-rendered hero, a lazily-hydrated component) can still be
// settling after this fires. Giving it a short extra window before navigate()
// returns measurably reduces (it can't fully eliminate — that would need
// page-specific knowledge) the odds that an immediate follow-up read (e.g.
// read_all_pages) catches a device mid-render.
const POST_NAVIGATE_SETTLE_MS = 500;

const waitForWebviewSettle = (target: Electron.WebviewTag): Promise<boolean> =>
  new Promise((resolve) => {
    let settled = false;
    const finish = (result: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      target.removeEventListener('did-stop-loading', onStopLoading);
      target.removeEventListener('did-fail-load', onFailLoad);
      resolve(result);
    };
    const onStopLoading = () => finish(true);
    const onFailLoad = (event: Electron.DidFailLoadEvent) => {
      // -3 (ERR_ABORTED) fires for in-page interruptions; the load may still complete.
      if (event.errorCode !== -3) {
        finish(false);
      }
    };
    const timer = setTimeout(() => finish(false), NAVIGATION_TIMEOUT_MS);
    target.addEventListener('did-stop-loading', onStopLoading);
    target.addEventListener('did-fail-load', onFailLoad);
  });

const navigate = async (
  store: AppStore,
  payload: McpNavigatePayload
): Promise<McpNavigateResult> => {
  const url = payload?.url;
  if (!url) {
    throw new Error('URL is required');
  }
  const activeDevices = getActiveDevices(store.getState());
  const primaryDevice = activeDevices[0];
  if (primaryDevice === undefined) {
    throw new Error('No active devices to navigate. Use the set_active_devices tool first.');
  }
  const primaryWebview = getDeviceWebview(primaryDevice.id);
  if (primaryWebview === null) {
    throw new Error('The device previews are not visible. Switch the app to the browser view.');
  }

  const deviceWebviews = activeDevices
    .map((device) => getDeviceWebview(device.id))
    .filter((target): target is Electron.WebviewTag => target !== null);

  // Every device not already at `url` — this is what we wait on before
  // returning. Previously only the primary device was awaited here, so a
  // caller reading every device right after navigate() returns (read_page on
  // a non-primary device, or read_all_pages) could catch a slower device
  // still mid-navigation from the *previous* URL.
  const pending = deviceWebviews.filter((target) => {
    try {
      return target.getURL() !== url;
    } catch {
      return true;
    }
  });

  const settling = Promise.all(pending.map(waitForWebviewSettle));

  if (url === store.getState().renderer.address) {
    // Address unchanged in state (e.g. reload after user navigated away): a
    // dispatch with the same value doesn't change any device's effect
    // dependency, so every pending device needs driving directly.
    pending.forEach((target) => {
      target.loadURL(url).catch(() => undefined);
    });
  } else {
    store.dispatch(setAddress(url));
  }

  const results = await settling;
  if (pending.length > 0) {
    await sleep(POST_NAVIGATE_SETTLE_MS);
  }
  const loaded = results.every(Boolean);

  return {url: primaryWebview.getURL(), pageTitle: primaryWebview.getTitle(), loaded};
};

const getCaptureTargets = (
  state: RootState,
  payload: McpCaptureTargetsPayload
): McpCaptureTargetsResult => {
  let devices = getActiveDevices(state);
  if (payload?.device !== undefined && payload.device !== '') {
    const device = resolveDeviceQuery(getDevicesMap(), payload.device);
    if (device === undefined) {
      throw new Error(
        `Unknown device: ${payload.device}. Use the list_devices tool to see valid ids and names.`
      );
    }
    if (!devices.some((d) => d.id === device.id)) {
      throw new Error(
        `Device "${device.name}" is not in the active preview. Use the set_active_devices tool to activate it first.`
      );
    }
    devices = [device];
  }

  const result: McpCaptureTargetsResult = {targets: [], skipped: []};
  devices.forEach((device) => {
    const webview = getDeviceWebview(device.id);
    if (webview === null) {
      result.skipped.push({
        deviceName: device.name,
        reason: 'preview is not mounted (the Focused layout shows a single device)',
      });
      return;
    }
    try {
      result.targets.push({
        deviceName: device.name,
        width: device.width,
        height: device.height,
        webContentsId: webview.getWebContentsId(),
        url: webview.getURL(),
      });
    } catch {
      result.skipped.push({deviceName: device.name, reason: 'preview is still loading'});
    }
  });
  return result;
};

const setJavascriptEnabled = async (
  store: AppStore,
  payload: McpSetJavascriptEnabledPayload
): Promise<McpSetJavascriptEnabledResult> => {
  const {device: deviceQuery, enabled} = payload ?? ({} as McpSetJavascriptEnabledPayload);
  if (!deviceQuery) {
    throw new Error('Provide a device id or name');
  }
  const device = resolveDeviceQuery(getDevicesMap(), deviceQuery);
  if (device === undefined) {
    throw new Error(
      `Unknown device: ${deviceQuery}. Use the list_devices tool to see valid ids and names.`
    );
  }
  if (!getActiveDevices(store.getState()).some((d) => d.id === device.id)) {
    throw new Error(
      `Device "${device.name}" is not in the active preview. Use the set_active_devices tool to activate it first.`
    );
  }
  const webview = getDeviceWebview(device.id);
  if (webview === null) {
    throw new Error(`The "${device.name}" preview is not mounted.`);
  }
  store.dispatch(setDeviceJavaScriptDisabled({id: device.id, disabled: !enabled}));
  await window.electron.ipcRenderer.invoke<SetJavascriptEnabledArgs, SetJavascriptEnabledResult>(
    IPC_MAIN_CHANNELS.SET_JAVASCRIPT_ENABLED,
    {webviewId: webview.getWebContentsId(), enabled}
  );
  return {deviceName: device.name, enabled};
};

const setNetworkScriptsBlocked = async (
  store: AppStore,
  payload: McpSetNetworkScriptsBlockedPayload
): Promise<McpSetNetworkScriptsBlockedResult> => {
  const {device: deviceQuery, blocked} = payload ?? ({} as McpSetNetworkScriptsBlockedPayload);
  if (!deviceQuery) {
    throw new Error('Provide a device id or name');
  }
  const device = resolveDeviceQuery(getDevicesMap(), deviceQuery);
  if (device === undefined) {
    throw new Error(
      `Unknown device: ${deviceQuery}. Use the list_devices tool to see valid ids and names.`
    );
  }
  if (!getActiveDevices(store.getState()).some((d) => d.id === device.id)) {
    throw new Error(
      `Device "${device.name}" is not in the active preview. Use the set_active_devices tool to activate it first.`
    );
  }
  const webview = getDeviceWebview(device.id);
  if (webview === null) {
    throw new Error(`The "${device.name}" preview is not mounted.`);
  }
  store.dispatch(setDeviceNetworkScriptsBlocked({id: device.id, blocked}));
  await window.electron.ipcRenderer.invoke<
    SetNetworkScriptsBlockedArgs,
    SetNetworkScriptsBlockedResult
  >(IPC_MAIN_CHANNELS.SET_NETWORK_SCRIPTS_BLOCKED, {
    webviewId: webview.getWebContentsId(),
    blocked,
  });
  return {deviceName: device.name, blocked};
};

export const executeMcpCommand = async (
  store: AppStore,
  command: McpBridgeCommand,
  payload: unknown
): Promise<unknown> => {
  switch (command) {
    case 'get-app-state':
      return getAppState(store.getState());
    case 'list-devices':
      return listDevices(store.getState());
    case 'set-active-devices':
      return setActiveDevices(store, payload as McpSetActiveDevicesPayload);
    case 'navigate':
      return navigate(store, payload as McpNavigatePayload);
    case 'get-capture-targets':
      return getCaptureTargets(store.getState(), (payload ?? {}) as McpCaptureTargetsPayload);
    case 'set-javascript-enabled':
      return setJavascriptEnabled(store, payload as McpSetJavascriptEnabledPayload);
    case 'set-network-scripts-blocked':
      return setNetworkScriptsBlocked(store, payload as McpSetNetworkScriptsBlockedPayload);
    default:
      throw new Error(`Unknown MCP command: ${command}`);
  }
};
