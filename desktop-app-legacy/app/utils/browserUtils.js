// @flow

import {MAX_ZOOM_LEVEL, MIN_ZOOM_LEVEL} from '../constants';

/**
 * Ensures that the given zoom level stays between MIN_ZOOM_LEVEL and MAX_ZOOM_LEVEL and returns it.
 * @param zoomLevel The zoom level to be normalized.
 */
export function normalizeZoomLevel(zoomLevel: number): number {
  if (zoomLevel < MIN_ZOOM_LEVEL) {
    return MIN_ZOOM_LEVEL;
  }

  if (zoomLevel > MAX_ZOOM_LEVEL) {
    return MAX_ZOOM_LEVEL;
  }

  return zoomLevel;
}
