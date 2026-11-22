interface MirroringSocket {
  connected: boolean;
  open: () => void;
  close: () => void;
  once: (event: string, listener: () => void) => void;
  off: (event: string, listener: () => void) => void;
  emit: (...args: unknown[]) => unknown;
  sendBuffer: unknown[];
  receiveBuffer: unknown[];
}

interface MirroringController {
  enabled: boolean;
  loading?: Promise<void>;
  socket?: MirroringSocket;
}

/**
 * Runs in the guest's main world (BrowserSync does not live in the isolated
 * preload world). Keep this function self-contained for executeJavaScript.
 */
export async function setBrowserSyncMirroring(enabled: boolean, scriptUrl: string): Promise<void> {
  const scope = window as unknown as {
    ___browserSync___?: {socket?: MirroringSocket};
    ___responsivelyMirroring___?: MirroringController;
  };
  const controller = (scope.___responsivelyMirroring___ ??= {enabled});
  controller.enabled = enabled;

  // A disabled preview never loads the client in a new document. This avoids
  // briefly joining the mirroring group on navigation or a device remount.
  if (!scope.___browserSync___?.socket && !controller.loading) {
    if (!enabled) return;
    controller.loading = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      const finish = (error?: string) => {
        clearTimeout(timeout);
        script.onload = null;
        script.onerror = null;
        if (error) {
          script.remove();
          reject(new Error(error));
        } else resolve();
      };
      const timeout = setTimeout(() => finish('BrowserSync client did not load.'), 3000);
      script.onload = () => finish();
      script.onerror = () => finish('BrowserSync client could not load.');
      document.body.appendChild(script);
    });
  }

  if (controller.loading) {
    try {
      await controller.loading;
    } finally {
      controller.loading = undefined;
    }
  }
  const socket = scope.___browserSync___?.socket;
  if (!socket) throw new Error('BrowserSync socket is not available.');
  if (controller.socket !== socket) {
    const emit = socket.emit;
    socket.emit = function guardedEmit(...args: unknown[]) {
      // Socket.IO queues outbound events while closed. Drop isolated input
      // instead, so re-enabling cannot replay clicks, typing, or scrolling.
      return controller.enabled ? emit.apply(this, args) : this;
    };
    controller.socket = socket;
  }
  if (!controller.enabled) {
    socket.close();
    socket.sendBuffer.length = 0;
    socket.receiveBuffer.length = 0;
    if (socket.connected) throw new Error('BrowserSync socket did not disconnect.');
    if (enabled) throw new Error('Event mirroring was superseded by a newer setting.');
    return;
  }
  if (!enabled) throw new Error('Event mirroring was superseded by a newer setting.');
  if (socket.connected) return;

  socket.sendBuffer.length = 0;
  socket.receiveBuffer.length = 0;
  await new Promise<void>((resolve, reject) => {
    const finish = (error?: string) => {
      clearTimeout(timeout);
      socket.off('connect', onConnected);
      socket.off('connect_error', onError);
      socket.off('disconnect', onDisconnected);
      if (error) reject(new Error(error));
      else resolve();
    };
    const onConnected = () =>
      finish(controller.enabled && socket.connected ? undefined : 'Event mirroring is disabled.');
    const onError = () => finish('BrowserSync could not connect.');
    const onDisconnected = () => finish('BrowserSync disconnected before mirroring was ready.');
    const timeout = setTimeout(() => finish('BrowserSync connection timed out.'), 3000);
    socket.once('connect', onConnected);
    socket.once('connect_error', onError);
    socket.once('disconnect', onDisconnected);
    socket.open();
  });
}
