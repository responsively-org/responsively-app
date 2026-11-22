import {EventEmitter} from 'events';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {acquireDebugger} from './debugger-lease';
import {setDeviceColorScheme} from './device-color-scheme';

vi.mock('electron', () => ({ipcMain: {handle: vi.fn()}, webContents: {fromId: vi.fn()}}));
vi.mock('./webview-registry', () => ({isRegisteredWebview: vi.fn(() => true)}));

const createContents = () => {
  const dbg = Object.assign(new EventEmitter(), {
    attached: false,
    attach: vi.fn(() => {
      dbg.attached = true;
    }),
    detach: vi.fn(() => {
      dbg.attached = false;
      dbg.emit('detach');
    }),
    isAttached: () => dbg.attached,
    sendCommand: vi.fn(async () => {}),
  });
  const contents = Object.assign(new EventEmitter(), {debugger: dbg, isDestroyed: () => false});
  return {contents: contents as unknown as Electron.WebContents, dbg};
};

describe('device color scheme emulation', () => {
  afterEach(() => vi.useRealTimers());

  it('keeps the debugger attached for emulation, updates the preference, then clears it', async () => {
    const {contents, dbg} = createContents();
    await setDeviceColorScheme(contents, 'dark');
    await setDeviceColorScheme(contents, 'light');
    expect(dbg.sendCommand.mock.calls).toEqual([
      ['Emulation.setEmulatedMedia', {features: [{name: 'prefers-color-scheme', value: 'dark'}]}],
      ['Emulation.setEmulatedMedia', {features: [{name: 'prefers-color-scheme', value: 'light'}]}],
    ]);
    expect(dbg.attach).toHaveBeenCalledTimes(1);
    expect(dbg.detach).not.toHaveBeenCalled();
    await setDeviceColorScheme(contents, 'system');
    expect(dbg.sendCommand).toHaveBeenLastCalledWith('Emulation.setEmulatedMedia', {features: []});
    expect(dbg.detach).toHaveBeenCalledTimes(1);
    expect(contents.listenerCount('destroyed')).toBe(0);
  });

  it('does not detach an inspector when resetting the preference', async () => {
    const {contents, dbg} = createContents();
    const releaseInspector = acquireDebugger(contents);
    await setDeviceColorScheme(contents, 'dark');
    await setDeviceColorScheme(contents, 'system');
    expect(dbg.detach).not.toHaveBeenCalled();
    releaseInspector();
    expect(dbg.detach).toHaveBeenCalledTimes(1);
  });

  it('clears external media overrides without detaching their debugger session', async () => {
    const {contents, dbg} = createContents();
    dbg.attach();
    await setDeviceColorScheme(contents, 'system');
    expect(dbg.sendCommand).toHaveBeenCalledExactlyOnceWith('Emulation.setEmulatedMedia', {
      features: [],
    });
    expect(dbg.attach).toHaveBeenCalledTimes(1);
    expect(dbg.detach).not.toHaveBeenCalled();
    expect(contents.listenerCount('destroyed')).toBe(0);
    expect(dbg.listenerCount('detach')).toBe(0);
  });

  it('isolates each guest and leaves system defaults unattached', async () => {
    const first = createContents();
    const second = createContents();
    await setDeviceColorScheme(first.contents, 'dark');
    await setDeviceColorScheme(second.contents, 'system');
    expect(first.dbg.sendCommand).toHaveBeenCalledTimes(1);
    expect(second.dbg.attach).not.toHaveBeenCalled();
    await setDeviceColorScheme(first.contents, 'system');
  });

  it('releases failed emulation and recovers on the next request', async () => {
    const {contents, dbg} = createContents();
    dbg.sendCommand.mockRejectedValueOnce(new Error('Unsupported emulation'));
    await expect(setDeviceColorScheme(contents, 'dark')).rejects.toThrow('Unsupported emulation');
    expect(dbg.detach).toHaveBeenCalledTimes(1);
    await setDeviceColorScheme(contents, 'light');
    expect(dbg.attach).toHaveBeenCalledTimes(2);
    await setDeviceColorScheme(contents, 'system');
  });

  it('reacquires a debugger that was detached externally', async () => {
    const {contents, dbg} = createContents();
    await setDeviceColorScheme(contents, 'dark');
    dbg.detach();
    await setDeviceColorScheme(contents, 'light');
    expect(dbg.attach).toHaveBeenCalledTimes(2);
    expect(contents.listenerCount('destroyed')).toBe(1);
    await setDeviceColorScheme(contents, 'system');
  });

  it('serializes concurrent preference changes', async () => {
    const {contents, dbg} = createContents();
    let finishFirst: (() => void) | undefined;
    dbg.sendCommand.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishFirst = resolve;
        })
    );
    const first = setDeviceColorScheme(contents, 'dark');
    const second = setDeviceColorScheme(contents, 'system');
    await vi.waitFor(() => expect(finishFirst).toBeDefined());
    expect(dbg.sendCommand).toHaveBeenCalledTimes(1);
    finishFirst?.();
    await Promise.all([first, second]);
    expect(dbg.sendCommand).toHaveBeenLastCalledWith('Emulation.setEmulatedMedia', {features: []});
    expect(dbg.detach).toHaveBeenCalledTimes(1);
  });

  it('times out a stalled guest, releases the lease, and unblocks later settings', async () => {
    vi.useFakeTimers();
    const {contents, dbg} = createContents();
    await setDeviceColorScheme(contents, 'dark');
    dbg.sendCommand.mockReturnValueOnce(new Promise(() => {}));
    const failure = expect(setDeviceColorScheme(contents, 'light')).rejects.toThrow(
      'did not respond within 5000ms'
    );
    const retry = setDeviceColorScheme(contents, 'dark');
    await vi.advanceTimersByTimeAsync(5000);
    await failure;
    await retry;
    expect(dbg.attach).toHaveBeenCalledTimes(2);
    expect(dbg.detach).toHaveBeenCalledTimes(1);
    expect(dbg.sendCommand).toHaveBeenLastCalledWith('Emulation.setEmulatedMedia', {
      features: [{name: 'prefers-color-scheme', value: 'dark'}],
    });
    await setDeviceColorScheme(contents, 'system');
    expect(vi.getTimerCount()).toBe(0);
  });
});
