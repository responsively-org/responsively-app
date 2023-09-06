/* eslint-disable promise/always-return */
import { Device } from 'common/deviceList';
import { ipcMain, shell, webContents } from 'electron';
import { writeFile, ensureDir } from 'fs-extra';
import path from 'path';
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
