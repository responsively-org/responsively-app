import {EventEmitter} from 'events';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {acquireDebugger} from '../debugger-lease';
import {captureFullPageImage} from './full-page';

const {createFromBuffer} = vi.hoisted(() => ({createFromBuffer: vi.fn()}));

vi.mock('electron', () => ({nativeImage: {createFromBuffer}}));

const metrics = {
  cssLayoutViewport: {clientWidth: 390, clientHeight: 844},
  cssContentSize: {width: 1500, height: 2400.25},
};
const screenshot = {data: Buffer.from('screenshot').toString('base64')};

const createContents = () => {
  const sendCommand = vi.fn(async (method: string) =>
    method === 'Page.getLayoutMetrics' ? metrics : screenshot
  );
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
    sendCommand,
  });
  const contents = {debugger: dbg, isDestroyed: () => false};
  return {contents: contents as unknown as Electron.WebContents, dbg, sendCommand};
};

describe('full-page screenshots', () => {
  beforeEach(() => {
    createFromBuffer.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('captures full document bounds including overflow without changing emulation', async () => {
    const {contents, dbg, sendCommand} = createContents();
    const image = {isEmpty: () => false};
    createFromBuffer.mockReturnValue(image);
    await expect(captureFullPageImage(contents)).resolves.toBe(image);
    expect(sendCommand.mock.calls).toEqual([
      ['Page.getLayoutMetrics'],
      [
        'Page.captureScreenshot',
        {
          format: 'png',
          fromSurface: true,
          captureBeyondViewport: true,
          clip: {x: 0, y: 0, width: 1500, height: 2401, scale: 1},
        },
      ],
    ]);
    expect(createFromBuffer).toHaveBeenCalledWith(Buffer.from('screenshot'));
    expect(dbg.detach).toHaveBeenCalledTimes(1);
  });

  it('releases a failed capture without detaching an active inspector', async () => {
    const {contents, dbg, sendCommand} = createContents();
    const releaseInspector = acquireDebugger(contents);
    sendCommand.mockRejectedValue(new Error('Capture failed'));
    await expect(captureFullPageImage(contents)).rejects.toThrow('Capture failed');
    expect(dbg.detach).not.toHaveBeenCalled();
    releaseInspector();
    expect(dbg.detach).toHaveBeenCalledTimes(1);
  });

  it('serializes concurrent full-page captures for the same guest', async () => {
    const {contents, sendCommand} = createContents();
    let finishFirst: ((value: typeof screenshot) => void) | undefined;
    sendCommand.mockResolvedValueOnce(metrics).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishFirst = resolve;
        })
    );
    const first = captureFullPageImage(contents);
    const second = captureFullPageImage(contents);
    await vi.waitFor(() => expect(finishFirst).toBeDefined());
    expect(sendCommand).toHaveBeenCalledTimes(2);
    finishFirst?.(screenshot);
    await Promise.all([first, second]);
    expect(sendCommand).toHaveBeenCalledTimes(4);
  });

  it('times out unresponsive guests and releases its attachment', async () => {
    vi.useFakeTimers();
    const {contents, dbg, sendCommand} = createContents();
    sendCommand.mockReturnValue(new Promise(() => {}));
    const result = captureFullPageImage(contents);
    const rejected = expect(result).rejects.toThrow('did not respond within 10000ms');
    await vi.advanceTimersByTimeAsync(10_000);
    await rejected;
    expect(dbg.detach).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
