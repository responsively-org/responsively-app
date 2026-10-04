// Device -> live <webview> lookup, keyed by the device's stable id rather
// than a DOM attribute. `document.getElementById(device.name)` is fragile:
// if a stale <webview> ever lingers after an imperfect teardown (the same
// timing issue behind the "Invalid guestInstanceId" bug), two elements can
// share the same id and getElementById silently returns whichever one is
// first in document order — not necessarily the one actually on screen.
const registry = new Map<string, Electron.WebviewTag>();

export const registerDeviceWebview = (deviceId: string, webview: Electron.WebviewTag): void => {
  registry.set(deviceId, webview);
};

// Only clears the entry if it still belongs to this exact instance: a newer
// mount's registration must never be undone by an older instance's delayed
// unmount running after it.
export const unregisterDeviceWebview = (deviceId: string, webview: Electron.WebviewTag): void => {
  if (registry.get(deviceId) === webview) {
    registry.delete(deviceId);
  }
};

export const getRegisteredDeviceWebview = (deviceId: string): Electron.WebviewTag | null =>
  registry.get(deviceId) ?? null;
