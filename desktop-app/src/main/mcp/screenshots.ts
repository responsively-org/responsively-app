import {nativeImage, webContents} from 'electron';
import {McpCaptureTargetsResult, McpSkippedCapture} from '../../common/mcp';
import {captureImage} from '../screenshot';
import {fileUrlRejection} from './file-url';

const MAX_SCREENSHOT_WIDTH = 1000;
const SCREENSHOT_JPEG_QUALITY = 80;

export interface ScreenshotOptions {
  fullPage?: boolean;
  originalResolution?: boolean;
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  data: string;
  mimeType: string;
}

export const captureTarget = async (
  target: McpCaptureTargetsResult['targets'][number],
  options: ScreenshotOptions = {}
): Promise<{content: [TextContent, ImageContent]} | {skip: McpSkippedCapture}> => {
  const targetContents = webContents.fromId(target.webContentsId);
  if (targetContents === undefined || targetContents.isDestroyed()) {
    return {skip: {deviceName: target.deviceName, reason: 'the preview was closed'}};
  }
  // Check the URL the preview is actually showing, before and after the
  // capture: a local .html page may have navigated to another local file.
  const blockedBefore = fileUrlRejection(targetContents.getURL());
  if (blockedBefore !== null) {
    return {skip: {deviceName: target.deviceName, reason: blockedBefore}};
  }
  try {
    const image = await captureImage(target.webContentsId, {fullPage: options.fullPage});
    const blockedAfter = targetContents.isDestroyed()
      ? 'the preview was closed'
      : fileUrlRejection(targetContents.getURL());
    if (blockedAfter !== null) {
      return {skip: {deviceName: target.deviceName, reason: blockedAfter}};
    }
    if (image === undefined || image.isEmpty()) {
      return {
        skip: {
          deviceName: target.deviceName,
          reason: 'capture returned an empty image (the app window may be hidden or minimized)',
        },
      };
    }
    const originalResolution = options.originalResolution === true;
    // NativeImage sizes are in DIP, while toPNG selects a physical bitmap.
    // Decode the highest captured representation at 1x so labels and the
    // compact width limit refer to actual output pixels, including on Retina.
    const scaleFactor = Math.max(...image.getScaleFactors());
    const capturedPng = image.toPNG({scaleFactor});
    const pixelImage = nativeImage.createFromBuffer(capturedPng);
    const output =
      !originalResolution && pixelImage.getSize().width > MAX_SCREENSHOT_WIDTH
        ? pixelImage.resize({width: MAX_SCREENSHOT_WIDTH})
        : pixelImage;
    const size = output.getSize();
    const data = originalResolution ? capturedPng : output.toJPEG(SCREENSHOT_JPEG_QUALITY);
    return {
      content: [
        {
          type: 'text',
          text: `${target.deviceName} (${target.width}x${target.height}) — ${target.url}\n${options.fullPage ? 'Full-page' : 'Viewport'} screenshot: ${size.width}x${size.height} pixels; ${originalResolution ? 'original resolution, PNG' : 'JPEG, max width 1000px'}.`,
        },
        {
          type: 'image',
          data: data.toString('base64'),
          mimeType: originalResolution ? 'image/png' : 'image/jpeg',
        },
      ],
    };
  } catch (error) {
    return {
      skip: {
        deviceName: target.deviceName,
        reason: `capture failed: ${error instanceof Error ? error.message : String(error)}`,
      },
    };
  }
};
