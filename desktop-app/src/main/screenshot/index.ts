import {Device} from 'common/deviceList';
import {ipcMain, shell, webContents} from 'electron';
import {writeFile, ensureDir} from 'fs-extra';
import path from 'path';
import {IPC_MAIN_CHANNELS} from '../../common/constants';
import store from '../../store';
import {isRegisteredWebview} from '../webview-registry';

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

const CAPTURE_ATTEMPTS = 3;
const CAPTURE_RETRY_DELAY_MS = 250;

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const captureImage = async (
  webContentsId: number
): Promise<Electron.NativeImage | undefined> => {
  // Single choke point for both the IPC and MCP screenshot paths.
  if (!isRegisteredWebview(webContentsId)) {
    return undefined;
  }
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

  // capturePage throws (e.g. UnknownVizError) or hands back an empty frame
  // while the guest's compositor surface is still settling — typically right
  // after a navigation or a freshly attached preview. That state is
  // transient, so retry briefly before reporting the capture as failed.
  let lastError: unknown;
  let image: Electron.NativeImage | undefined;
  for (let attempt = 0; attempt < CAPTURE_ATTEMPTS; attempt += 1) {
    if (attempt > 0) {
      await delay(CAPTURE_RETRY_DELAY_MS);
    }
    try {
      image = await WebContents?.capturePage();
      lastError = undefined;
      if (image !== undefined && !image.isEmpty()) {
        return image;
      }
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError !== undefined) {
    throw lastError;
  }
  return image;
};

const quickScreenshot = async (arg: ScreenshotArgs): Promise<ScreenshotResult> => {
  const {
    webContentsId,
    device: {name},
  } = arg;
  const image = await captureImage(webContentsId);
  if (image === undefined) {
    return {done: false};
  }
  const fileName = name.replaceAll('/', '-').replaceAll(':', '-');
  const dir = store.get('userPreferences.screenshot.saveLocation');
  const filePath = path.join(dir, `/${fileName}-${Date.now()}.jpeg`);
  await ensureDir(dir);
  await writeFile(filePath, image.toJPEG(100));
  if (process.env.E2E_TEST === 'true') {
    // Record the call for E2E test verification without opening Finder
    const g = global as typeof globalThis & {__e2eShowItemCalls?: string[]};
    g.__e2eShowItemCalls = g.__e2eShowItemCalls || [];
    g.__e2eShowItemCalls.push(filePath);
  } else {
    setTimeout(() => shell.showItemInFolder(filePath), 100);
  }

  return {done: true};
};

const captureAllDecies = async (args: Array<ScreenshotAllArgs>): Promise<ScreenshotResult> => {
  const screenShots = args.map((arg) => {
    const {device, webContentsId} = arg;
    const screenShotArg: ScreenshotArgs = {device, webContentsId};
    return quickScreenshot(screenShotArg);
  });

  await Promise.all(screenShots);
  return {done: true};
};

export const initScreenshotHandlers = () => {
  ipcMain.handle(
    IPC_MAIN_CHANNELS.SCREENSHOT,
    async (_, arg: ScreenshotArgs): Promise<ScreenshotResult> => {
      return quickScreenshot(arg);
    }
  );

  ipcMain.handle(
    IPC_MAIN_CHANNELS.SCREENSHOT_ALL,
    async (event, args: Array<ScreenshotAllArgs>) => {
      return captureAllDecies(args);
    }
  );
};
