import { Device } from 'common/deviceList';
import { ipcMain, shell, webContents } from 'electron';
import { writeFile, ensureDir } from 'fs-extra';
import path from 'path';

export interface ScreenshotArgs {
  webContentsId: number;
  fullPage?: boolean;
  device: Device;
}

export interface ScreenshotResult {
  done: boolean;
}

const quickScreenshot = async (
  arg: ScreenshotArgs
): Promise<ScreenshotResult> => {
  const { webContentsId } = arg;
  const image = await webContents.fromId(webContentsId).capturePage();
  const dir = path.join(
    process.env.HOME || '.',
    `/Desktop/Responsively-Screenshots`
  );
  const filePath = path.join(dir, `/screenshot-${Date.now()}.jpeg`);
  await ensureDir(dir);
  await writeFile(filePath, image.toJPEG(100));
  setTimeout(() => shell.showItemInFolder(filePath), 100);

  return { done: true };
};

export const initScreenshotHandlers = () => {
  ipcMain.handle(
    'screenshot',
    async (_, arg: ScreenshotArgs): Promise<ScreenshotResult> => {
      return quickScreenshot(arg);
    }
  );
};
