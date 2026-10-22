import {describe, expect, it} from 'vitest';
import {frameImageStyle, layoutFrame, orientArtwork, type FrameArtwork} from './geometry';

// A 100×220 phone drawing whose 80×180 screen sits 10px from the left and
// 20px from the top (so the chin is 20px too).
const phone: FrameArtwork = {
  src: 'phone.svg',
  width: 100,
  height: 220,
  screen: {x: 10, y: 20, width: 80, height: 180},
  screenRadius: 8,
  orientation: 'portrait',
  source: 'test',
};

// A 300×200 laptop drawing: 240×150 screen, 30px side bezels, 10px top, 40px base.
const laptop: FrameArtwork = {
  src: 'laptop.svg',
  width: 300,
  height: 200,
  screen: {x: 30, y: 10, width: 240, height: 150},
  screenRadius: 0,
  orientation: 'landscape',
  source: 'test',
};

describe('orientArtwork', () => {
  it('is the identity when the artwork already matches', () => {
    expect(orientArtwork(phone, 'portrait')).toEqual({
      rotation: 0,
      width: 100,
      height: 220,
      screen: phone.screen,
    });
  });

  it('turns portrait artwork counter-clockwise for landscape', () => {
    const oriented = orientArtwork(phone, 'landscape');
    expect(oriented.rotation).toBe(-90);
    expect(oriented.width).toBe(220);
    expect(oriented.height).toBe(100);
    // The top bezel (20px) is now on the left; the left bezel (10px) is at
    // the bottom, so the screen starts 10px from the top.
    expect(oriented.screen).toEqual({x: 20, y: 10, width: 180, height: 80});
  });

  it('turns landscape artwork clockwise for portrait', () => {
    const oriented = orientArtwork(laptop, 'portrait');
    expect(oriented.rotation).toBe(90);
    expect(oriented.width).toBe(200);
    expect(oriented.height).toBe(300);
    // The 40px base is now on the left, the 10px top bezel on the right.
    expect(oriented.screen).toEqual({x: 40, y: 30, width: 150, height: 240});
  });
});

describe('layoutFrame', () => {
  it('scales an exact-aspect screen so the cut-out equals the webview', () => {
    // 160×360 webview = 2× the 80×180 cut-out.
    const layout = layoutFrame(phone, 160, 360);
    expect(layout.rotation).toBe(0);
    expect(layout.scale).toBe(2);
    expect(layout.width).toBe(200);
    expect(layout.height).toBe(440);
    expect(layout.screenLeft).toBe(20);
    expect(layout.screenTop).toBe(40);
    expect(layout.screenRadius).toBe(16);
  });

  it('never lets the cut-out cover the page: the larger ratio wins and the rest is centred', () => {
    // Wider than the cut-out's aspect (80:180 = 0.444; 100:180 = 0.556).
    const layout = layoutFrame(phone, 100, 180);
    expect(layout.scale).toBe(1.25);
    // Cut-out is 100×225 at this scale: the 180px webview is centred vertically.
    expect(layout.screenLeft).toBe(12.5);
    expect(layout.screenTop).toBeCloseTo(20 * 1.25 + (225 - 180) / 2);
  });

  it('rotates portrait artwork for a landscape webview', () => {
    const layout = layoutFrame(phone, 360, 160);
    expect(layout.rotation).toBe(-90);
    expect(layout.scale).toBe(2);
    expect(layout.width).toBe(440);
    expect(layout.height).toBe(200);
    expect(layout.screenLeft).toBe(40);
    expect(layout.screenTop).toBe(20);
    // The drawn image keeps its own (unrotated) dimensions.
    expect(layout.imageWidth).toBe(200);
    expect(layout.imageHeight).toBe(440);
  });

  it('keeps landscape artwork upright for a landscape webview', () => {
    const layout = layoutFrame(laptop, 480, 300);
    expect(layout.rotation).toBe(0);
    expect(layout.scale).toBe(2);
    expect(layout.width).toBe(600);
    expect(layout.height).toBe(400);
    expect(layout.screenLeft).toBe(60);
    expect(layout.screenTop).toBe(20);
  });
});

describe('frameImageStyle', () => {
  it('offsets a rotated image by half the size difference so it fills the box', () => {
    const style = frameImageStyle(layoutFrame(phone, 360, 160));
    expect(style.left).toBe((440 - 200) / 2);
    expect(style.top).toBe((200 - 440) / 2);
    expect(style.width).toBe(200);
    expect(style.height).toBe(440);
    expect(style.transform).toBe('rotate(-90deg)');
  });

  it('leaves an unrotated image at the origin without a transform', () => {
    const style = frameImageStyle(layoutFrame(phone, 160, 360));
    expect(style.left).toBe(0);
    expect(style.top).toBe(0);
    expect(style.transform).toBeUndefined();
  });
});
