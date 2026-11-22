import {EVENT_MIRRORING_CHANNELS} from 'common/event-mirroring';
import {applyEventMirroring} from './event-mirroring';

class Webview extends EventTarget {
  send = vi.fn();

  acknowledge(enabled: boolean, error?: string) {
    const request = this.send.mock.calls[this.send.mock.calls.length - 1][1];
    this.dispatchEvent(
      Object.assign(new Event('ipc-message'), {
        channel: EVENT_MIRRORING_CHANNELS.APPLIED,
        args: [{...request, enabled, error}],
      })
    );
  }

  get element() {
    return this as unknown as Electron.WebviewTag;
  }
}

describe('event mirroring application', () => {
  afterEach(() => vi.useRealTimers());

  it('shares in-flight hook and MCP requests and waits for a matching acknowledgement', async () => {
    const webview = new Webview();
    const first = applyEventMirroring(webview.element, false);
    const second = applyEventMirroring(webview.element, false);
    expect(first).toBe(second);
    expect(webview.send).toHaveBeenCalledOnce();
    webview.acknowledge(false);
    await first;
    await second;
  });

  it('supersedes a pending preference without letting its response confirm a newer setting', async () => {
    const webview = new Webview();
    const first = applyEventMirroring(webview.element, false);
    const rejection = expect(first).rejects.toThrow('superseded');
    const second = applyEventMirroring(webview.element, true);
    webview.acknowledge(true);
    await rejection;
    await second;
  });

  it('retries on dom-ready if the guest was not ready when the request started', async () => {
    const webview = new Webview();
    webview.send.mockImplementationOnce(() => {
      throw new Error('not ready');
    });
    const result = applyEventMirroring(webview.element, false);
    webview.dispatchEvent(new Event('dom-ready'));
    expect(webview.send).toHaveBeenCalledTimes(2);
    webview.acknowledge(false);
    await result;
  });

  it('reports guest failures and times out when no acknowledgement arrives', async () => {
    vi.useFakeTimers();
    const webview = new Webview();
    const first = applyEventMirroring(webview.element, true);
    webview.acknowledge(true, 'BrowserSync could not connect.');
    await expect(first).rejects.toThrow('could not connect');

    const second = applyEventMirroring(webview.element, true);
    const rejection = expect(second).rejects.toThrow('Timed out');
    await vi.advanceTimersByTimeAsync(7000);
    await rejection;
  });
});
