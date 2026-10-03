import {BitmapStitcher} from './bitmap-stitcher';
import {captureViewport, delay} from './capture-viewport';

const SCROLL_PAINT_DELAY_MS = 100;

interface PageMetrics {
  height: number;
  viewportHeight: number;
  scrollX: number;
  scrollY: number;
}

const getPageMetrics = async (contents: Electron.WebContents) =>
  contents.executeJavaScript(`({
    height: Math.max(
      document.body?.scrollHeight ?? 0,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    ),
    viewportHeight: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY
  })`) as Promise<PageMetrics>;

const getCapturePositions = ({height, viewportHeight}: PageMetrics) => {
  const maxScrollY = Math.max(0, height - viewportHeight);
  const positions: number[] = [];
  for (let y = 0; y < maxScrollY; y += viewportHeight) {
    positions.push(y);
  }
  positions.push(maxScrollY);
  return positions;
};

const beginCapture = (contents: Electron.WebContents) =>
  contents.executeJavaScript(`
    window.__responsivelyScreenshotInProgress = true;
    window.__responsivelyScreenshotStyleRestore = {
      html: document.documentElement.getAttribute('style'),
      body: document.body?.getAttribute('style') ?? null
    };
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    document.documentElement.style.setProperty('scroll-snap-type', 'none', 'important');
    document.body?.style.setProperty('scroll-behavior', 'auto', 'important');
    document.body?.style.setProperty('scroll-snap-type', 'none', 'important');
  `);

const endCapture = (contents: Electron.WebContents, metrics: PageMetrics) =>
  contents.executeJavaScript(`
    const restore = window.__responsivelyScreenshotStyleRestore;
    if (restore?.html === null) document.documentElement.removeAttribute('style');
    else if (restore) document.documentElement.setAttribute('style', restore.html);
    if (document.body) {
      if (restore?.body === null) document.body.removeAttribute('style');
      else if (restore) document.body.setAttribute('style', restore.body);
    }
    delete window.__responsivelyScreenshotStyleRestore;
    window.scrollTo({left: ${metrics.scrollX}, top: ${metrics.scrollY}, behavior: 'instant'});
    window.__responsivelyScreenshotInProgress = false;
  `);

const scrollTo = (contents: Electron.WebContents, y: number) =>
  contents.executeJavaScript(`new Promise((resolve) => {
    window.scrollTo({left: 0, top: ${y}, behavior: 'instant'});
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(window.scrollY)));
  })`) as Promise<number>;

export const captureFullPage = async (contents: Electron.WebContents) => {
  const metrics = await getPageMetrics(contents);
  const stitcher = new BitmapStitcher(metrics.height, metrics.viewportHeight);

  await beginCapture(contents);
  try {
    for (const requestedY of getCapturePositions(metrics)) {
      const actualY = await scrollTo(contents, requestedY);
      // The DOM observes scrolling before the guest compositor presents it.
      // Force a repaint so capturePage does not return the previous tile.
      contents.invalidate();
      await delay(SCROLL_PAINT_DELAY_MS);
      const tile = await captureViewport(contents);
      if (tile === undefined) {
        return undefined;
      }
      stitcher.append(tile, actualY);
    }
  } finally {
    await endCapture(contents, metrics);
  }

  return stitcher.toImage();
};
