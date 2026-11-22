import {EVENT_MIRRORING_CHANNELS, type EventMirroringResponse} from 'common/event-mirroring';

let nextRequestId = 0;
const pending = new WeakMap<
  Electron.WebviewTag,
  {enabled: boolean; promise: Promise<void>; cancel: () => void}
>();

/** Apply the session preference and await the guest's verified socket state. */
export function applyEventMirroring(webview: Electron.WebviewTag, enabled: boolean): Promise<void> {
  const existing = pending.get(webview);
  if (existing?.enabled === enabled) return existing.promise;
  existing?.cancel();

  const requestId = ++nextRequestId;
  let cancel = () => {};
  const promise = new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timeout);
      webview.removeEventListener('ipc-message', onMessage);
      webview.removeEventListener('dom-ready', send);
    };
    const finish = (error?: string) => {
      cleanup();
      if (error) reject(new Error(error));
      else resolve();
    };
    const send = () => {
      try {
        webview.send(EVENT_MIRRORING_CHANNELS.SET, {requestId, enabled});
      } catch {
        // An attached element may still be creating its guest. dom-ready
        // retries the same request, within the overall deadline.
      }
    };
    const onMessage = (event: Electron.IpcMessageEvent) => {
      if (event.channel !== EVENT_MIRRORING_CHANNELS.APPLIED) return;
      const response = event.args[0] as EventMirroringResponse | undefined;
      if (response?.requestId !== requestId || response.enabled !== enabled) return;
      finish(response.error);
    };
    const timeout = setTimeout(
      () =>
        finish('Timed out applying event mirroring to this preview. Try again when it is ready.'),
      7000
    );
    cancel = () => finish('Event mirroring was superseded by a newer setting.');
    webview.addEventListener('ipc-message', onMessage);
    webview.addEventListener('dom-ready', send);
    send();
  });
  pending.set(webview, {enabled, promise, cancel});
  const release = () => {
    if (pending.get(webview)?.promise === promise) pending.delete(webview);
  };
  void promise.then(release, release);
  return promise;
}
