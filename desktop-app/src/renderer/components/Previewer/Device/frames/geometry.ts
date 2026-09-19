import type {CSSProperties} from 'react';

/**
 * Geometry for real device frames.
 *
 * Artwork is described once, in the orientation it was drawn in, by the
 * rectangle of its (transparent) screen cut-out. This module rotates that
 * description for landscape previews and fits the artwork around a scaled
 * webview so the cut-out lands exactly on the page.
 */

export interface FrameRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type FrameOrientation = 'portrait' | 'landscape';

export interface FrameArtwork {
  /** Bundled URL of the frame body. The screen area must be transparent. */
  src: string;
  /** Natural size of the artwork, in image pixels. */
  width: number;
  height: number;
  /** The screen cut-out inside the artwork, in image pixels. */
  screen: FrameRect;
  /** Corner radius of the screen cut-out, in image pixels. */
  screenRadius: number;
  /** Orientation the artwork is drawn in. */
  orientation: FrameOrientation;
  /** Key into FRAME_SOURCES (attribution). */
  source: string;
}

/** CSS rotation, in degrees, that turns the artwork into the preview's orientation. */
export type FrameRotation = 0 | 90 | -90;

export interface FrameLayout {
  src: string;
  rotation: FrameRotation;
  /** Uniform artwork-pixel → CSS-pixel scale. */
  scale: number;
  /** Outer box of the rotated frame, CSS px. */
  width: number;
  height: number;
  /** Size of the artwork as drawn (before rotation), CSS px. */
  imageWidth: number;
  imageHeight: number;
  /** Position of the webview's top-left corner inside the outer box, CSS px. */
  screenLeft: number;
  screenTop: number;
  /** Screen corner radius, CSS px. */
  screenRadius: number;
}

/** The artwork's box and screen rectangle after rotating it into `orientation`. */
export const orientArtwork = (
  artwork: FrameArtwork,
  orientation: FrameOrientation
): {rotation: FrameRotation; width: number; height: number; screen: FrameRect} => {
  const {width, height, screen} = artwork;
  if (artwork.orientation === orientation) {
    return {rotation: 0, width, height, screen};
  }
  if (artwork.orientation === 'portrait') {
    // Counter-clockwise: the top of the device ends up on the left, the way
    // a phone is usually turned for landscape.
    return {
      rotation: -90,
      width: height,
      height: width,
      screen: {
        x: screen.y,
        y: width - (screen.x + screen.width),
        width: screen.height,
        height: screen.width,
      },
    };
  }
  // Landscape artwork shown portrait: clockwise, so the left edge becomes the top.
  return {
    rotation: 90,
    width: height,
    height: width,
    screen: {
      x: height - (screen.y + screen.height),
      y: screen.x,
      width: screen.height,
      height: screen.width,
    },
  };
};

/**
 * Fits `artwork` around a webview that is `screenWidth`×`screenHeight` CSS px
 * on screen. The artwork is scaled uniformly so its cut-out is never smaller
 * than the webview on either axis (an approximate frame whose screen aspect
 * differs slightly letterboxes rather than covering page content) and the
 * webview is centred in the cut-out.
 */
export const layoutFrame = (
  artwork: FrameArtwork,
  screenWidth: number,
  screenHeight: number
): FrameLayout => {
  const orientation: FrameOrientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
  const oriented = orientArtwork(artwork, orientation);
  const scale = Math.max(
    screenWidth / oriented.screen.width,
    screenHeight / oriented.screen.height
  );
  const screen = oriented.screen;
  return {
    src: artwork.src,
    rotation: oriented.rotation,
    scale,
    width: oriented.width * scale,
    height: oriented.height * scale,
    imageWidth: artwork.width * scale,
    imageHeight: artwork.height * scale,
    screenLeft: screen.x * scale + (screen.width * scale - screenWidth) / 2,
    screenTop: screen.y * scale + (screen.height * scale - screenHeight) / 2,
    screenRadius: artwork.screenRadius * scale,
  };
};

/**
 * Inline style that places the (unrotated) image inside the outer box so
 * that, after `rotation`, it fills the box exactly. A W×H image rotated by
 * ±90° about its centre becomes H×W around the same centre, so the image is
 * offset by half the difference on each axis.
 */
export const frameImageStyle = (layout: FrameLayout): CSSProperties => ({
  position: 'absolute',
  left: (layout.width - layout.imageWidth) / 2,
  top: (layout.height - layout.imageHeight) / 2,
  width: layout.imageWidth,
  height: layout.imageHeight,
  maxWidth: 'none',
  transform: layout.rotation === 0 ? undefined : `rotate(${layout.rotation}deg)`,
});
