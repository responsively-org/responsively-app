import {EventEmitter} from 'node:events';
import {setBrowserSyncMirroring} from './browser-sync-mirroring';

class Socket extends EventEmitter {
  connected = true;

  sendBuffer: unknown[] = [];

  receiveBuffer: unknown[] = [];

  open = vi.fn();

  close = vi.fn(() => {
    this.connected = false;
  });
}

const installSocket = (socket: Socket) => {
  Object.assign(window, {___browserSync___: {socket}});
};

describe('BrowserSync mirroring controller', () => {
  beforeEach(() => {
    Reflect.deleteProperty(window, '___browserSync___');
    Reflect.deleteProperty(window, '___responsivelyMirroring___');
    document.body.innerHTML = '';
  });
  afterEach(() => vi.useRealTimers());

  it('keeps a disabled new document isolated without injecting a client', async () => {
    await setBrowserSyncMirroring(false, 'https://localhost/client.js');
    expect(document.querySelector('script')).toBeNull();
  });

  it('disconnects and drops isolated events instead of replaying them on enable', async () => {
    const socket = new Socket();
    socket.sendBuffer.push('old click');
    socket.receiveBuffer.push('old scroll');
    const onClick = vi.fn();
    socket.on('click', onClick);
    installSocket(socket);

    await setBrowserSyncMirroring(false, '');
    expect(socket.close).toHaveBeenCalledOnce();
    expect(socket.sendBuffer).toEqual([]);
    expect(socket.receiveBuffer).toEqual([]);
    socket.emit('click', 'isolated');
    expect(onClick).not.toHaveBeenCalled();

    socket.open.mockImplementation(() => {
      socket.connected = true;
      socket.emit('connect');
    });
    await setBrowserSyncMirroring(true, '');
    socket.emit('click', 'mirrored');
    expect(onClick).toHaveBeenCalledExactlyOnceWith('mirrored');
  });

  it('waits for an actual connection and fails within a deadline', async () => {
    vi.useFakeTimers();
    const socket = new Socket();
    socket.connected = false;
    installSocket(socket);
    const application = setBrowserSyncMirroring(true, '');
    const rejected = expect(application).rejects.toThrow('connection timed out');
    await vi.advanceTimersByTimeAsync(3000);
    await rejected;
    expect(socket.listenerCount('connect')).toBe(0);
  });

  it('applies disable before a pending client can join the mirroring group', async () => {
    const enabling = setBrowserSyncMirroring(true, 'https://localhost/client.js');
    const superseded = expect(enabling).rejects.toThrow('superseded');
    const disabling = setBrowserSyncMirroring(false, '');
    const socket = new Socket();
    socket.connected = false;
    installSocket(socket);
    document.querySelector('script')!.dispatchEvent(new Event('load'));
    await disabling;
    await superseded;
    expect(socket.open).not.toHaveBeenCalled();
    expect(socket.connected).toBe(false);
  });

  it('reports a failed client load and permits a later retry', async () => {
    const first = setBrowserSyncMirroring(true, 'https://localhost/client.js');
    document.querySelector('script')!.dispatchEvent(new Event('error'));
    await expect(first).rejects.toThrow('could not load');
    expect(document.querySelector('script')).toBeNull();

    const retry = setBrowserSyncMirroring(true, 'https://localhost/client.js');
    installSocket(new Socket());
    document.querySelector('script')!.dispatchEvent(new Event('load'));
    await retry;
  });
});
