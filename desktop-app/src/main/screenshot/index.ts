import { ipcMain, shell, webContents } from 'electron';
import { MergeImages } from '../../common/image/merge';
import {
  ScreenshotArgs,
  ScreenshotResult,
  EventData,
  ImageBufferData,
} from '../../common/image/types';
import {
  getResponsivelyScreenshotFilePath,
  openFinder,
} from '../../common/fileUtils';
import { Bitmap } from '../../common/image/bitmap';

const captureImage = async (
  webContentsId: number
): Promise<Electron.NativeImage | undefined> => {
  const Image = await webContents.fromId(webContentsId)?.capturePage();
  return Image;
};

const saveImage = async (
  image: Buffer,
  height: number,
  width: number,
  name: string
) => {
  const filePath = await getResponsivelyScreenshotFilePath(name);
  const bitmap = new Bitmap({ data: image, height, width });
  await bitmap.writeFile(filePath);
  openFinder(filePath);
  return { done: true };
};

const quickScreenshot = async (
  arg: ScreenshotArgs,
  isSaveImage = true
): Promise<ScreenshotResult> => {
  const {
    webContentsId,
    device: { name },
  } = arg;
  const image = await captureImage(webContentsId);
  if (image === undefined) {
    return { done: false, image: undefined };
  }
  const imageData = image.toBitmap();
  const sizes = image.getSize();
  if (isSaveImage) await saveImage(imageData, sizes.height, sizes.width, name);

  return {
    done: true,
    image: { data: imageData, height: sizes.height, width: sizes.width },
  };
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
      .map((result) => result.image);
    const mergeImages = new MergeImages(buffers as ImageBufferData[]);
    const bitmap = mergeImages.merge();
    const filePath = await getResponsivelyScreenshotFilePath(args.prefix);
    await bitmap.writeFile(filePath);
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
