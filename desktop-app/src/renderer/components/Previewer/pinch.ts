/**
 * Pinch gestures (ctrl+wheel) over a webview are seen only by the guest page;
 * its preload forwards them via `pass-pinch-data` and Device re-emits them
 * here, in host window coordinates, for the Previewer's single zoom handler.
 */
export const PREVIEW_PINCH_EVENT = 'preview-pinch';

export interface PinchDetail {
  deltaY: number;
  /** Focal point in host viewport coordinates. */
  x: number;
  y: number;
}

export const emitPinch = (detail: PinchDetail) => {
  window.dispatchEvent(new CustomEvent<PinchDetail>(PREVIEW_PINCH_EVENT, {detail}));
};
