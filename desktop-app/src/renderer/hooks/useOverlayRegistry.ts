import {IPC_MAIN_CHANNELS} from 'common/constants';
import {useEffect} from 'react';

/*
 * Docked devtools is a native WebContentsView, so it paints above every DOM
 * element regardless of z-index — modals and popovers that overlap it are
 * simply hidden behind it (#694/#651). Overlays register here while they are
 * open and the main process detaches the devtools view for the duration.
 *
 * A count, not a boolean: overlays nest (a popover inside a modal), and the
 * devtools may only come back when the last one closes.
 */
let openOverlayCount = 0;
let lastReportedState: boolean | null = null;

const reportOverlayState = () => {
  const isOpen = openOverlayCount > 0;
  if (isOpen === lastReportedState) {
    return;
  }
  lastReportedState = isOpen;
  window.electron.ipcRenderer.invoke(IPC_MAIN_CHANNELS.SET_OVERLAY_OPEN, {isOpen});
};

export const registerOverlay = (): (() => void) => {
  openOverlayCount += 1;
  reportOverlayState();
  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    openOverlayCount -= 1;
    reportOverlayState();
  };
};

/** Keeps the docked devtools out of the way while `isOpen` is true. */
const useOverlayRegistry = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    return registerOverlay();
  }, [isOpen]);
};

export default useOverlayRegistry;
