import {EventEmitter} from 'events';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';

const ipcRenderer = vi.hoisted(() => ({
  emitter: null as unknown as EventEmitter,
}));

vi.mock('electron', async () => {
  const {EventEmitter: Emitter} = await import('events');
  ipcRenderer.emitter = new Emitter();
  return {
    contextBridge: {
      exposeInMainWorld: (key: string, api: unknown) => {
        (globalThis as unknown as Record<string, unknown>)[`exposed_${key}`] = api;
      },
    },
    ipcRenderer: ipcRenderer.emitter,
  };
});

type Bridge = Window['electron']['ipcRenderer'];
let bridge: Bridge;

const emit = (channel: string, ...args: unknown[]) =>
  ipcRenderer.emitter.emit(channel, {}, ...args);

describe('preload ipcRenderer bridge', () => {
  beforeAll(async () => {
    await import('./preload');
    bridge = (globalThis as unknown as {exposed_electron: Window['electron']}).exposed_electron
      .ipcRenderer;
  });

  beforeEach(() => {
    ipcRenderer.emitter.removeAllListeners();
  });

  it('calls a handler without the IPC event', () => {
    const handler = vi.fn();
    bridge.on('reload', handler);

    emit('reload', {ignoreCache: true});

    expect(handler).toHaveBeenCalledWith({ignoreCache: true});
  });

  it('removeListener stops the handler that was registered with on', () => {
    const handler = vi.fn();
    bridge.on('reload', handler);

    bridge.removeListener('reload', handler);
    emit('reload', {});

    expect(handler).not.toHaveBeenCalled();
    expect(ipcRenderer.emitter.listenerCount('reload')).toBe(0);
  });

  it('removeListener only removes the given handler', () => {
    const removed = vi.fn();
    const kept = vi.fn();
    bridge.on('reload', removed);
    bridge.on('reload', kept);

    bridge.removeListener('reload', removed);
    emit('reload', {});

    expect(removed).not.toHaveBeenCalled();
    expect(kept).toHaveBeenCalledTimes(1);
  });

  it('removeListener leaves the same handler on other channels', () => {
    const handler = vi.fn();
    bridge.on('reload', handler);
    bridge.on('other', handler);

    bridge.removeListener('reload', handler);
    emit('other', 1);

    expect(handler).toHaveBeenCalledWith(1);
  });

  it('the function returned by on removes just that registration', () => {
    const handler = vi.fn();
    const off = bridge.on('reload', handler);

    off?.();
    emit('reload', {});

    expect(handler).not.toHaveBeenCalled();
  });

  it('removeAllListeners drops every handler on the channel', () => {
    const handler = vi.fn();
    bridge.on('reload', handler);

    bridge.removeAllListeners('reload');
    emit('reload', {});

    expect(handler).not.toHaveBeenCalled();
  });
});
