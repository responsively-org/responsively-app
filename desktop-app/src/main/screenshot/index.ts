/* eslint-disable promise/always-return */
import { Device } from 'common/deviceList';
import { ipcMain, shell, webContents } from 'electron';
import { writeFile, ensureDir } from 'fs-extra';
import path from 'path';
import { homedir } from 'os';

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
): Promise<Electron.NativeImage> => {
  const Image = await webContents.fromId(webContentsId).capturePage();
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
  const dir = path.join(homedir(), `Desktop/Responsively-Screenshots`);
  const filePath = path.join(dir, `/${name}-${Date.now()}.jpeg`);
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
};
