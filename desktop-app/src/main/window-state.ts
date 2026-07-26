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
};
