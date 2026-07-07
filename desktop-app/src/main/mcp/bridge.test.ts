import {beforeEach, describe, expect, it, vi} from 'vitest';
import {IPC_MAIN_CHANNELS} from '../../common/constants';
import {McpBridgeResponse} from '../../common/mcp';
import {initMcpBridge, sendBridgeCommand} from './bridge';

const {listeners} = vi.hoisted(() => ({
  listeners: new Map<string, (event: unknown, ...args: any[]) => void>(),
}));

vi.mock('electron', () => ({
  ipcMain: {
    on: (channel: string, listener: (event: unknown, ...args: any[]) => void) => {
      listeners.set(channel, listener);
    },
  },
  BrowserWindow: class {},
}));

const emitResponse = (response: McpBridgeResponse) => {
  listeners.get(IPC_MAIN_CHANNELS.MCP_COMMAND_RESPONSE)?.({}, response);
};

const createWindowMock = () => {
  const send = vi.fn();
  const window = {
    isDestroyed: () => false,
    webContents: {send},
  };
  return {window: window as any, send};
};

const sentRequestId = (send: ReturnType<typeof vi.fn>): string => send.mock.calls[0][1].requestId;

describe('mcp bridge', () => {
  beforeEach(() => {
    listeners.clear();
    initMcpBridge();
  });

  it('resolves with the correlated result', async () => {
    const {window, send} = createWindowMock();
    const promise = sendBridgeCommand(() => window, 'get-app-state');
    expect(send).toHaveBeenCalledWith(
      IPC_MAIN_CHANNELS.MCP_COMMAND,
      expect.objectContaining({command: 'get-app-state'})
    );
    emitResponse({requestId: sentRequestId(send), ok: true, result: {url: 'https://a.com'}});
    await expect(promise).resolves.toEqual({url: 'https://a.com'});
  });

  it('rejects when the renderer reports an error', async () => {
    const {window, send} = createWindowMock();
    const promise = sendBridgeCommand(() => window, 'navigate', {url: 'x'});
    emitResponse({requestId: sentRequestId(send), ok: false, error: 'No active devices'});
    await expect(promise).rejects.toThrow('No active devices');
  });

  it('rejects on timeout and drops the late reply', async () => {
    vi.useFakeTimers();
    try {
      const {window, send} = createWindowMock();
      const promise = sendBridgeCommand(() => window, 'list-devices', undefined, 50);
      const rejection = expect(promise).rejects.toThrow(/did not respond/);
      vi.advanceTimersByTime(51);
      await rejection;
      // A reply arriving after the timeout must not throw or resolve anything.
      emitResponse({requestId: sentRequestId(send), ok: true, result: []});
    } finally {
      vi.useRealTimers();
    }
  });

  it('ignores responses for unknown request ids', () => {
    expect(() => emitResponse({requestId: 'unknown', ok: true, result: null})).not.toThrow();
  });

  it('rejects immediately when the window is not open', async () => {
    await expect(sendBridgeCommand(() => null, 'get-app-state')).rejects.toThrow(
      /window is not open/
    );
    const destroyed = {isDestroyed: () => true, webContents: {send: vi.fn()}};
    await expect(sendBridgeCommand(() => destroyed as any, 'get-app-state')).rejects.toThrow(
      /window is not open/
    );
  });
});
