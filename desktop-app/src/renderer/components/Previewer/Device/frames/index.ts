import type {Device} from 'common/deviceList';
import {layoutFrame, type FrameArtwork} from './geometry';
import {FRAME_ARTWORK, type FrameId} from './manifest';
import {DEVICE_FRAME_IDS} from './mapping';

export type {FrameArtwork, FrameLayout} from './geometry';
export {frameImageStyle, layoutFrame} from './geometry';
export {FRAME_SOURCES} from './manifest';

export interface DeviceFrame extends FrameArtwork {
  id: FrameId;
}

/**
 * The real hardware frame for a device, or null when the device has none
 * (custom devices, and models nobody has drawn under a redistributable
 * licence) — the caller falls back to the generic CSS bezel.
 */
export const getDeviceFrame = (device: Device): DeviceFrame | null => {
  if (device.isCustom) {
    return null;
  }
  const id = DEVICE_FRAME_IDS[device.id];
  if (id === undefined) {
    return null;
  }
  const artwork = FRAME_ARTWORK[id];
  return artwork === undefined ? null : {id, ...artwork};
};

/**
 * Outer size of a device once its frame is drawn around an unscaled
 * `width`×`height` viewport (the canvas auto-arrange budget). Devices without
 * artwork report their own size.
 */
export const framedSize = (
  device: Device,
  width: number,
  height: number
): {width: number; height: number} => {
  const frame = getDeviceFrame(device);
  if (frame === null) {
    return {width, height};
  }
  const layout = layoutFrame(frame, width, height);
  return {width: layout.width, height: layout.height};
};
