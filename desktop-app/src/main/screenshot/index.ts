/* eslint-disable promise/always-return */
import { Device } from 'common/deviceList';
import { ipcMain, nativeImage, shell, webContents } from 'electron';
import { createHash } from 'crypto';
import { ensureDir, pathExists, remove, writeFile } from 'fs-extra';
import path from 'path';
import {
  VISUAL_DIFF_CHANNELS,
  VisualBaselineMeta,
  VisualDiffRequest,
  VisualDiffResultPayload,
} from '../../common/visualDiff';
import store from '../../store';

export interface ScreenshotArgs {
  webContentsId: number;
  fullPage?: boolean;
  device: Device;
}

export interface ScreenshotAllArgs {
  webContentsId: number;
  device: Device;
  previousHeight: string;
  previousTransform: string;
  pageHeight: number;
}

export interface ScreenshotResult {
  done: boolean;
}
const captureImage = async (
  webContentsId: number
): Promise<Electron.NativeImage | undefined> => {
  const WebContents = webContents.fromId(webContentsId);

  const isExecuted = await WebContents?.executeJavaScript(`
    if (window.isExecuted) {
      true;
    }
  `);

  if (!isExecuted) {
    await WebContents?.executeJavaScript(`
      const bgColor = window.getComputedStyle(document.body).backgroundColor;
      if (bgColor === 'rgba(0, 0, 0, 0)') {
        document.body.style.backgroundColor = 'white';
      }
      window.isExecuted = true;
    `);
  }

  const Image = await WebContents?.capturePage();
  return Image;
};

const quickScreenshot = async (
  arg: ScreenshotArgs
): Promise<ScreenshotResult> => {
  const {
    webContentsId,
    device: { name },
  } = arg;
  const image = await captureImage(webContentsId);
  if (image === undefined) {
    return { done: false };
  }
  const fileName = name.replaceAll('/', '-').replaceAll(':', '-');
  const dir = store.get('userPreferences.screenshot.saveLocation');
  const filePath = path.join(dir, `/${fileName}-${Date.now()}.jpeg`);
  await ensureDir(dir);
  await writeFile(filePath, image.toJPEG(100));
  setTimeout(() => shell.showItemInFolder(filePath), 100);

  return { done: true };
};

const captureAllDecies = async (
  args: Array<ScreenshotAllArgs>
): Promise<ScreenshotResult> => {
  const screenShots = args.map((arg) => {
    const { device, webContentsId } = arg;
    const screenShotArg: ScreenshotArgs = { device, webContentsId };
    return quickScreenshot(screenShotArg);
  });

  await Promise.all(screenShots);
  return { done: true };
};

const getBaselineDirectory = () => {
  const dir = store.get('userPreferences.screenshot.saveLocation');
  return path.join(dir, 'visual-baselines');
};

const sanitizeSegment = (value: string) =>
  value.replace(/[^a-zA-Z0-9-_]/g, '_');

const createBaselineFilename = (
  deviceName: string,
  deviceId: string,
  address: string
) => {
  const hash = createHash('md5').update(address).digest('hex').slice(0, 12);
  return `${sanitizeSegment(deviceName || deviceId)}-${hash}.png`;
};

const getBaselines = (): VisualBaselineMeta[] => {
  return store.get('visualDiff.baselines') || [];
};

const saveBaselines = (entries: VisualBaselineMeta[]) => {
  store.set('visualDiff.baselines', entries);
};

const findBaseline = (deviceId: string, address: string) => {
  return getBaselines().find(
    (baseline) => baseline.deviceId === deviceId && baseline.address === address
  );
};

const removeBaselineFile = async (filePath: string) => {
  if (await pathExists(filePath)) {
    await remove(filePath);
  }
};

const captureBaseline = async (request: VisualDiffRequest) => {
  const image = await captureImage(request.webContentsId);
  if (!image) {
    throw new Error('Failed to capture webview screenshot.');
  }

  const { width, height } = image.getSize();
  const baselineDir = getBaselineDirectory();
  await ensureDir(baselineDir);
  const fileName = createBaselineFilename(
    request.deviceName,
    request.deviceId,
    request.address
  );
  const filePath = path.join(baselineDir, fileName);

  const previousBaseline = findBaseline(request.deviceId, request.address);
  if (previousBaseline) {
    await removeBaselineFile(previousBaseline.filePath);
  }

  await writeFile(filePath, image.toPNG());

  const baselines = getBaselines().filter(
    (baseline) =>
      !(
        baseline.deviceId === request.deviceId &&
        baseline.address === request.address
      )
  );
  baselines.push({
    deviceId: request.deviceId,
    deviceName: request.deviceName,
    address: request.address,
    filePath,
    width,
    height,
    createdAt: Date.now(),
  });
  saveBaselines(baselines);

  return { filePath };
};

const createDiffPayload = (
  baselineImage: Electron.NativeImage,
  currentImage: Electron.NativeImage,
  meta: VisualBaselineMeta
): VisualDiffResultPayload => {
  const { width, height } = meta;
  const baselineBitmap = baselineImage.toBitmap({ scaleFactor: 1 });
  const normalizedCurrent = currentImage.resize({ width, height });
  const currentBitmap = normalizedCurrent.toBitmap({ scaleFactor: 1 });

  if (baselineBitmap.length !== currentBitmap.length) {
    throw new Error('Image dimensions do not match.');
  }

  const diffBitmap = Buffer.alloc(baselineBitmap.length);
  let diffPixels = 0;
  const threshold = 30;

  for (let i = 0; i < baselineBitmap.length; i += 4) {
    const diff =
      Math.abs(baselineBitmap[i] - currentBitmap[i]) +
      Math.abs(baselineBitmap[i + 1] - currentBitmap[i + 1]) +
      Math.abs(baselineBitmap[i + 2] - currentBitmap[i + 2]);
    const avgDiff = diff / 3;
    if (avgDiff > threshold) {
      diffPixels += 1;
      diffBitmap[i] = 255;
      diffBitmap[i + 1] = 0;
      diffBitmap[i + 2] = 0;
      diffBitmap[i + 3] = 200;
    } else {
      diffBitmap[i] = 0;
      diffBitmap[i + 1] = 0;
      diffBitmap[i + 2] = 0;
      diffBitmap[i + 3] = 0;
    }
  }

  const diffImage = nativeImage.createFromBitmap(diffBitmap, {
    width,
    height,
    scaleFactor: 1,
  });

  const totalPixels = width * height;
  const mismatchPercentage = Number(
    ((diffPixels / totalPixels) * 100).toFixed(2)
  );

  return {
    deviceId: meta.deviceId,
    deviceName: meta.deviceName,
    address: meta.address,
    createdAt: meta.createdAt,
    baselineDataUrl: baselineImage.toDataURL(),
    currentDataUrl: normalizedCurrent.toDataURL(),
    diffDataUrl: diffImage.toDataURL(),
    mismatchPercentage,
  };
};

const compareWithBaseline = async (
  request: VisualDiffRequest
): Promise<VisualDiffResultPayload> => {
  const baselineMeta = findBaseline(request.deviceId, request.address);
  if (!baselineMeta) {
    throw new Error(
      'No baseline screenshot found. Please save a baseline first.'
    );
  }

  if (!(await pathExists(baselineMeta.filePath))) {
    throw new Error('Baseline screenshot file not found.');
  }

  const baselineImage = nativeImage.createFromPath(baselineMeta.filePath);
  if (baselineImage.isEmpty()) {
    throw new Error('Failed to load baseline screenshot.');
  }

  const currentImage = await captureImage(request.webContentsId);
  if (!currentImage) {
    throw new Error('Failed to capture current page.');
  }

  return createDiffPayload(baselineImage, currentImage, baselineMeta);
};

export const initScreenshotHandlers = () => {
  ipcMain.handle(
    'screenshot',
    async (_, arg: ScreenshotArgs): Promise<ScreenshotResult> => {
      return quickScreenshot(arg);
    }
  );

  ipcMain.handle(
    'screenshot:All',
    async (event, args: Array<ScreenshotAllArgs>) => {
      return captureAllDecies(args);
    }
  );

  ipcMain.handle(
    VISUAL_DIFF_CHANNELS.CAPTURE_BASELINE,
    async (_, request: VisualDiffRequest) => {
      return captureBaseline(request);
    }
  );

  ipcMain.handle(
    VISUAL_DIFF_CHANNELS.COMPARE_WITH_BASELINE,
    async (_, request: VisualDiffRequest) => {
      return compareWithBaseline(request);
    }
  );
};
