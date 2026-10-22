import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {defaultDevices, type Device} from 'common/deviceList';
import {FRAMES} from '../../../../../../.erb/scripts/device-frames/sources';
import {framedSize, getDeviceFrame, layoutFrame} from './index';
import {FRAME_ARTWORK, FRAME_SOURCES} from './manifest';
import {DEVICE_FRAME_IDS} from './mapping';

const deviceNamed = (name: string): Device => {
  const device = defaultDevices.find((candidate) => candidate.name === name);
  if (device === undefined) {
    throw new Error(`Missing built-in device: ${name}`);
  }
  return device;
};

describe('device artwork mapping', () => {
  it('connects every exact catalog/source match to its own artwork', () => {
    const matches = FRAMES.flatMap((frame) => {
      const device = defaultDevices.find((candidate) => candidate.name === frame.name);
      return device === undefined ? [] : [{device, frame}];
    });

    expect(matches.length).toBeGreaterThan(0);
    for (const {device, frame} of matches) {
      expect(getDeviceFrame(device)?.id, device.name).toBe(frame.id);
    }
  });

  it.each([
    ['iPhone SE', 'iphone-se-2'],
    ['Nexus 7', 'nexus-7'],
    ['iPhone 17 Air', 'iphone-air'],
    ['MacBook Pro', 'laptop'],
  ])('resolves the documented %s source-name alias', (name, frameId) => {
    expect(getDeviceFrame(deviceNamed(name))?.id).toBe(frameId);
  });

  it('only maps built-in device IDs to bundled, attributed artwork', () => {
    for (const [deviceId, frameId] of Object.entries(DEVICE_FRAME_IDS)) {
      const device = defaultDevices.find((candidate) => candidate.id === deviceId);
      expect(device, deviceId).toBeDefined();
      expect(frameId, deviceId).toBeDefined();
      if (device !== undefined) {
        const frame = getDeviceFrame(device);
        expect(frame?.src, device.name).toBeTruthy();
        expect(FRAME_SOURCES[frame?.source ?? ''], device.name).toBeDefined();
      }
    }
  });

  it.each([
    'iPhone 13 Pro Max',
    'iPhone 14 Plus',
    'iPhone 14 Pro Max',
    'iPad Mini',
    'iPad Air',
    'iPad Pro M4',
    'MacBook Air M3',
    'Pixel Fold',
    'Galaxy S24',
    'Nothing Phone 2',
    'laptopWithTouch',
  ])('keeps the generic fallback for %s instead of borrowing another model', (name) => {
    const device = deviceNamed(name);
    expect(getDeviceFrame(device)).toBeNull();
    expect(framedSize(device, device.width, device.height)).toEqual({
      width: device.width,
      height: device.height,
    });
  });

  it('keeps a custom device generic even when its name matches supported hardware', () => {
    const custom = {...deviceNamed('iPhone 12 Pro'), id: 'custom-device-id', isCustom: true};
    expect(getDeviceFrame(custom)).toBeNull();
  });

  it('does not give imported custom devices artwork when their ID collides with a preset', () => {
    const custom = {...deviceNamed('iPhone 12 Pro'), name: 'My custom phone', isCustom: true};
    expect(getDeviceFrame(custom)).toBeNull();
  });

  it.each(['iPhone 12 Pro', 'iPad', 'MacBook Pro', 'Pixel Tablet'])(
    'reserves the full %s artwork in both viewport orientations',
    (name) => {
      const device = deviceNamed(name);
      const frame = getDeviceFrame(device);
      expect(frame).not.toBeNull();
      if (frame === null) {
        return;
      }

      for (const [width, height] of [
        [device.width, device.height],
        [device.height, device.width],
      ]) {
        const layout = layoutFrame(frame, width, height);
        const size = framedSize(device, width, height);
        expect(size).toEqual({width: layout.width, height: layout.height});
        expect(size.width).toBeGreaterThan(width);
        expect(size.height).toBeGreaterThan(height);
        expect(layout.screenLeft).toBeGreaterThanOrEqual(0);
        expect(layout.screenTop).toBeGreaterThanOrEqual(0);
        expect(layout.screenLeft + width).toBeLessThanOrEqual(size.width);
        expect(layout.screenTop + height).toBeLessThanOrEqual(size.height);
      }
    }
  );
});

describe('bundled artwork manifest', () => {
  it('includes each licensed source asset with valid screen geometry and WebP data', () => {
    expect(Object.keys(FRAME_ARTWORK).sort()).toEqual(FRAMES.map((frame) => frame.id).sort());

    for (const [id, frame] of Object.entries(FRAME_ARTWORK)) {
      expect(FRAME_SOURCES[frame.source], id).toBeDefined();
      expect(frame.screen.x, id).toBeGreaterThanOrEqual(0);
      expect(frame.screen.y, id).toBeGreaterThanOrEqual(0);
      expect(frame.screen.width, id).toBeGreaterThan(0);
      expect(frame.screen.height, id).toBeGreaterThan(0);
      expect(frame.screen.x + frame.screen.width, id).toBeLessThanOrEqual(frame.width);
      expect(frame.screen.y + frame.screen.height, id).toBeLessThanOrEqual(frame.height);
      expect(frame.screenRadius, id).toBeGreaterThanOrEqual(0);
      expect(frame.screenRadius, id).toBeLessThanOrEqual(
        Math.min(frame.screen.width, frame.screen.height) / 2
      );

      const data = readFileSync(
        join(dirname(fileURLToPath(import.meta.url)), 'assets', `${id}.webp`)
      );
      expect(data.subarray(0, 4).toString(), id).toBe('RIFF');
      expect(data.subarray(8, 12).toString(), id).toBe('WEBP');
      expect(data.readUInt32LE(4) + 8, id).toBe(data.length);
    }
  });
});
