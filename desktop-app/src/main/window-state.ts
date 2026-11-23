import {BrowserWindow, Rectangle, screen} from 'electron';
import store from '../store';

export interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

const intersects = (a: Rectangle, b: {x?: number; y?: number; width: number; height: number}) => {
  if (b.x === undefined || b.y === undefined) {
    return false;
  }
  return b.x < a.x + a.width && b.x + b.width > a.x && b.y < a.y + a.height && b.y + b.height > a.y;
};

/**
 * Restores the last window bounds, falling back to the full work area when
 * nothing was saved or the saved bounds no longer land on a connected display
 * (e.g. an unplugged monitor).
 */
export const getSavedWindowState = (): WindowState => {
  const {width, height} = screen.getPrimaryDisplay().workAreaSize;
  const fallback: WindowState = {width, height, isMaximized: false};
  const saved = store.get('windowState') as Partial<WindowState> | undefined;
  if (!saved?.width || !saved?.height) {
    return fallback;
  }
  const onScreen = screen
    .getAllDisplays()
    .some((display) =>
      intersects(display.workArea, saved as {x?: number; y?: number; width: number; height: number})
    );
  if (saved.x !== undefined && !onScreen) {
    return fallback;
  }
  return {
    x: saved.x,
    y: saved.y,
    width: saved.width,
    height: saved.height,
    isMaximized: Boolean(saved.isMaximized),
  };
};

export const trackWindowState = (window: BrowserWindow) => {
  window.on('close', () => {
    if (window.isDestroyed()) {
      return;
    }
    const bounds = window.getNormalBounds();
    store.set('windowState', {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: window.isMaximized(),
    });
  });

  // Electron bug: on Windows, reloading the renderer (Ctrl+R or DevTools
  // reload) causes the BrowserWindow to expand to the full work area when the
  // window is in a snapped / non-maximised custom position.
  // Workaround: snapshot the current bounds immediately before the reload
  // begins (did-start-loading fires synchronously in the main process before
  // the renderer is torn down) so that ready-to-show can restore them.
  // See: https://github.com/electron/electron/issues/25359
  let boundsSnapshot: (WindowState & {x: number; y: number}) | null = null;

  window.webContents.on('did-start-loading', () => {
    if (window.isDestroyed() || !window.isVisible()) {
      return;
    }
    const bounds = window.getNormalBounds();
    boundsSnapshot = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: window.isMaximized(),
    };
  });

  window.on('ready-to-show', () => {
    if (!boundsSnapshot || window.isDestroyed()) {
      return;
    }
    const snap = boundsSnapshot;
    boundsSnapshot = null;
    if (snap.isMaximized) {
      // Already maximised — Electron handles this correctly; nothing to do.
      return;
    }
    // Restore the bounds that existed before the reload. setBounds is a no-op
    // when the values are already correct, so this is safe to call every time.
    window.setBounds({x: snap.x, y: snap.y, width: snap.width, height: snap.height});
  });
};
