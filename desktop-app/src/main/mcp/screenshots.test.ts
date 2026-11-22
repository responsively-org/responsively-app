import {beforeEach, describe, expect, it, vi} from 'vitest';
import {captureTarget} from './screenshots';

const {captureImage, fromId, createFromBuffer} = vi.hoisted(() => ({
  captureImage: vi.fn(),
  fromId: vi.fn(),
  createFromBuffer: vi.fn(),
}));

vi.mock('electron', () => ({
  webContents: {fromId},
  nativeImage: {createFromBuffer},
}));
vi.mock('../screenshot', () => ({captureImage}));

const target = {
  deviceId: 'desktop',
  deviceName: 'Desktop',
  width: 1440,
  height: 900,
  webContentsId: 42,
  url: 'https://example.com',
};

const createImage = (width: number, height: number) => {
  const resized = {
    getSize: () => ({width: 1000, height: Math.round((height * 1000) / width)}),
    toJPEG: vi.fn(() => Buffer.from('resized jpeg')),
  };
  const image = {
    isEmpty: () => false,
    getSize: () => ({width, height}),
    getScaleFactors: () => [1],
    resize: vi.fn(() => resized),
    toJPEG: vi.fn(() => Buffer.from('jpeg')),
    toPNG: vi.fn(() => Buffer.from('png')),
  };
  return {image, resized};
};

describe('MCP screenshot options', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fromId.mockReturnValue({isDestroyed: () => false, getURL: () => 'https://example.com'});
  });

  it('keeps the default compact JPEG and reports actual image dimensions', async () => {
    const {image, resized} = createImage(1440, 900);
    captureImage.mockResolvedValue(image);
    createFromBuffer.mockReturnValue(image);
    const result = await captureTarget(target);
    expect(captureImage).toHaveBeenCalledWith(42, {fullPage: undefined});
    expect(image.resize).toHaveBeenCalledWith({width: 1000});
    expect(resized.toJPEG).toHaveBeenCalledWith(80);
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Desktop (1440x900) — https://example.com\nViewport screenshot: 1000x625 pixels; JPEG, max width 1000px.',
        },
        {
          type: 'image',
          data: Buffer.from('resized jpeg').toString('base64'),
          mimeType: 'image/jpeg',
        },
      ],
    });
  });

  it('preserves original pixels in a lossless PNG, including the highest Retina scale', async () => {
    const {image} = createImage(720, 450);
    const {image: pixelImage} = createImage(1440, 900);
    image.getScaleFactors = () => [1, 2];
    captureImage.mockResolvedValue(image);
    createFromBuffer.mockReturnValue(pixelImage);
    const result = await captureTarget(target, {originalResolution: true});
    expect(image.toPNG).toHaveBeenCalledWith({scaleFactor: 2});
    expect(pixelImage.resize).not.toHaveBeenCalled();
    expect(pixelImage.toJPEG).not.toHaveBeenCalled();
    expect(result).toEqual({
      content: [
        {type: 'text', text: expect.stringContaining('1440x900 pixels; original resolution, PNG')},
        {type: 'image', data: Buffer.from('png').toString('base64'), mimeType: 'image/png'},
      ],
    });
  });

  it('caps the physical Retina image width even when the DIP width is below the cap', async () => {
    const {image} = createImage(720, 450);
    const {image: pixelImage} = createImage(1440, 900);
    image.getScaleFactors = () => [2];
    captureImage.mockResolvedValue(image);
    createFromBuffer.mockReturnValue(pixelImage);
    await captureTarget(target);
    expect(pixelImage.resize).toHaveBeenCalledWith({width: 1000});
  });

  it.each([false, true])(
    'combines full page with originalResolution=%s',
    async (originalResolution) => {
      const {image} = createImage(390, 2400);
      captureImage.mockResolvedValue(image);
      createFromBuffer.mockReturnValue(image);
      const result = await captureTarget(target, {fullPage: true, originalResolution});
      expect(captureImage).toHaveBeenCalledWith(42, {fullPage: true});
      expect(image.resize).not.toHaveBeenCalled();
      expect(result).toEqual({
        content: [
          {type: 'text', text: expect.stringContaining('Full-page screenshot: 390x2400 pixels')},
          expect.objectContaining({mimeType: originalResolution ? 'image/png' : 'image/jpeg'}),
        ],
      });
    }
  );

  it('skips a closed preview without attempting to capture it', async () => {
    fromId.mockReturnValue({isDestroyed: () => true, getURL: () => 'https://example.com'});
    await expect(captureTarget(target)).resolves.toEqual({
      skip: {deviceName: 'Desktop', reason: 'the preview was closed'},
    });
    expect(captureImage).not.toHaveBeenCalled();
  });

  it('reports individual empty or failed captures without rejecting the other devices', async () => {
    captureImage.mockResolvedValueOnce({isEmpty: () => true});
    await expect(captureTarget(target)).resolves.toEqual({
      skip: {deviceName: 'Desktop', reason: expect.stringContaining('empty image')},
    });
    captureImage.mockRejectedValueOnce(new Error('Target detached'));
    await expect(captureTarget(target, {fullPage: true})).resolves.toEqual({
      skip: {deviceName: 'Desktop', reason: 'capture failed: Target detached'},
    });
  });

  it('skips a preview showing a local file that is not .html/.htm (#1559)', async () => {
    fromId.mockReturnValue({isDestroyed: () => false, getURL: () => 'file:///etc/passwd'});
    const result = await captureTarget(target);
    expect(captureImage).not.toHaveBeenCalled();
    expect(result).toEqual({
      skip: {
        deviceName: 'Desktop',
        reason: expect.stringContaining('Only .html and .htm files can be opened'),
      },
    });
  });

  it('drops the image when the preview navigated to such a file during capture', async () => {
    const urls = ['https://example.com', 'file:///etc/passwd'];
    fromId.mockReturnValue({
      isDestroyed: () => false,
      getURL: () => urls.shift() ?? 'file:///etc/passwd',
    });
    captureImage.mockResolvedValue(createImage(1440, 900).image);
    const result = await captureTarget(target);
    expect(result).toEqual({
      skip: {
        deviceName: 'Desktop',
        reason: expect.stringContaining('Only .html and .htm files can be opened'),
      },
    });
  });
});
