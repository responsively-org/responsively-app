import {BrowserWindowConstructorOptions} from 'electron';

/** Matches the renderer's TitleBar height (design: 38px). */
export const TITLE_BAR_HEIGHT = 38;

/**
 * Only macOS gets the frameless Hybrid Studio title bar, where the native
 * traffic lights sit on top of our own 38px bar.
 *
 * Windows and Linux keep their native window frame on purpose: hiding it
 * makes Electron fold the application menu into the title bar strip, and the
 * menu should behave the way it does in every other native app on those
 * platforms — its own bar, directly below the title bar.
 */
export const usesCustomTitleBar = process.platform === 'darwin';

export const getTitleBarOptions = (): BrowserWindowConstructorOptions => {
  if (!usesCustomTitleBar) {
    return {};
  }
  return {
    titleBarStyle: 'hidden',
    trafficLightPosition: {x: 14, y: (TITLE_BAR_HEIGHT - 16) / 2},
  };
};
