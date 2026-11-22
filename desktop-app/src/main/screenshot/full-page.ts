import {nativeImage} from 'electron';
import {acquireDebugger} from '../debugger-lease';

const CAPTURE_TIMEOUT_MS = 10_000;
const captures = new WeakMap<Electron.WebContents, Promise<Electron.NativeImage>>();

interface LayoutMetrics {
  cssLayoutViewport: {clientWidth: number; clientHeight: number};
  cssContentSize: {width: number; height: number};
}

const withCaptureTimeout = async <T>(work: Promise<T>): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error('The full-page screenshot did not respond within 10000ms')),
          CAPTURE_TIMEOUT_MS
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

const capture = async (contents: Electron.WebContents): Promise<Electron.NativeImage> => {
  const releaseDebugger = acquireDebugger(contents);
  try {
    const metrics: LayoutMetrics = await withCaptureTimeout(
      contents.debugger.sendCommand('Page.getLayoutMetrics')
    );
    // Capture horizontal overflow too, without resizing the guest: its layout,
    // vh units, and fixed/sticky positioning still use the responsive viewport.
    const width = Math.ceil(
      Math.max(metrics.cssLayoutViewport.clientWidth, metrics.cssContentSize.width)
    );
    const height = Math.ceil(
      Math.max(metrics.cssLayoutViewport.clientHeight, metrics.cssContentSize.height)
    );
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      throw new Error('The page has no capturable dimensions');
    }
    const result: {data: string} = await withCaptureTimeout(
      contents.debugger.sendCommand('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: true,
        clip: {x: 0, y: 0, width, height, scale: 1},
      })
    );
    return nativeImage.createFromBuffer(Buffer.from(result.data, 'base64'));
  } finally {
    releaseDebugger();
  }
};

export const captureFullPageImage = (contents: Electron.WebContents) => {
  // Chromium temporarily adjusts capture state internally. Serialize captures
  // for a guest while allowing different devices to be captured in parallel.
  const previous = captures.get(contents) ?? Promise.resolve();
  const current = previous.then(
    () => capture(contents),
    () => capture(contents)
  );
  captures.set(contents, current);
  return current.finally(() => {
    if (captures.get(contents) === current) {
      captures.delete(contents);
    }
  });
};
