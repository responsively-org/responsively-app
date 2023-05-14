import { ipcMain, shell, webContents } from 'electron';
import { writeFile, ensureDir } from 'fs-extra';
import path from 'path';
import { homedir } from 'os';
import { MergeImages } from '../../common/image/merge';
import { Device } from '../../common/deviceList';

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
  image: Image | undefined;
}

export interface Image {
  width: number;
  height: number;
  data: Buffer;
}
export interface FormData {
  captureEachImage: boolean;
  mergeImages: boolean;
  prefix: string;
}

export type EventData = FormData & { screens: Array<ScreenshotAllArgs> };

const captureImage = async (
  webContentsId: number
): Promise<Electron.NativeImage | undefined> => {
  const Image = await webContents.fromId(webContentsId)?.capturePage();
  return Image;
};

const getPath = async (name: string) => {
  const dir = path.join(homedir(), `Desktop/Responsively-Screenshots`);
  const filePath = path.join(dir, `/${name}-${Date.now()}.jpeg`);
  await ensureDir(dir);
  return filePath;
};

const saveImage = async (image: Buffer, name: string) => {
  const filePath = await getPath(name);
  await writeFile(filePath, image);
  setTimeout(() => shell.showItemInFolder(filePath), 100);
  return { done: true };
};

const quickScreenshot = async (
  arg: ScreenshotArgs,
  isSaveImage = true
): Promise<ScreenshotResult> => {
  const {
    webContentsId,
    device: { name, height, width },
  } = arg;
  const image = await captureImage(webContentsId);
  if (image === undefined) {
    return { done: false, image: undefined };
  }
  const JPEGImage = image.toJPEG(100);
  if (isSaveImage) await saveImage(JPEGImage, name);

  return { done: true, image: { data: JPEGImage, height, width } };
};

const captureAllDecies = async (
  args: EventData
): Promise<{ done: boolean }> => {
  const screenShots = args.screens.map((arg) => {
    const { device, webContentsId } = arg;
    const screenShotArg: ScreenshotArgs = { device, webContentsId };
    return quickScreenshot(screenShotArg, args.captureEachImage);
  });

  const results = await Promise.all(screenShots);
  if (args.mergeImages) {
    const buffers = results
      .filter((result) => result.image !== undefined)
      .map((result) => result.image!.data);
    const mergeImages = new MergeImages(buffers);
    const bitmap = mergeImages.merge();
    const filePath = await getPath(args.prefix);
    await bitmap.writeFile(filePath, 90);
    setTimeout(() => shell.showItemInFolder(filePath), 100);
  }
  return { done: true };
};

export const initScreenshotHandlers = () => {
  ipcMain.handle(
    'screenshot',
    async (_, arg: ScreenshotArgs): Promise<ScreenshotResult> => {
      return quickScreenshot(arg);
    }
  );

  ipcMain.handle('screenshot:All', async (event, args: EventData) => {
    return captureAllDecies(args);
  });
};
