import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {webContents} from 'electron';
import {
  McpAppState,
  McpCaptureTargetsResult,
  McpDeviceInfo,
  McpNavigateResult,
  McpSetActiveDevicesResult,
  McpSkippedCapture,
} from '../../common/mcp';
import {captureImage} from '../screenshot';
import {GetMainWindow, sendBridgeCommand} from './bridge';
import {clickElement, readPage, typeText} from './interactions';
import {toolDefs} from './toolDefs';
import {normalizeUrl} from './utils';

const MAX_SCREENSHOT_WIDTH = 1000;
const SCREENSHOT_JPEG_QUALITY = 80;
const NAVIGATE_BRIDGE_TIMEOUT_MS = 35_000;

interface TextContent {
  type: 'text';
  text: string;
}

interface ImageContent {
  type: 'image';
  data: string;
  mimeType: string;
}

const textResult = (value: unknown) => ({
  content: [{type: 'text' as const, text: JSON.stringify(value, null, 2)}],
});

const errorResult = (error: unknown) => ({
  content: [{type: 'text' as const, text: error instanceof Error ? error.message : String(error)}],
  isError: true,
});

const captureTarget = async (
  target: McpCaptureTargetsResult['targets'][number]
): Promise<{content: [TextContent, ImageContent]} | {skip: McpSkippedCapture}> => {
  const targetContents = webContents.fromId(target.webContentsId);
  if (targetContents === undefined || targetContents.isDestroyed()) {
    return {skip: {deviceName: target.deviceName, reason: 'the preview was closed'}};
  }
  let image: Electron.NativeImage | undefined;
  try {
    image = await captureImage(target.webContentsId);
  } catch (error) {
    return {
      skip: {
        deviceName: target.deviceName,
        reason: `capture failed: ${error instanceof Error ? error.message : String(error)}`,
      },
    };
  }
  if (image === undefined || image.isEmpty()) {
    return {
      skip: {
        deviceName: target.deviceName,
        reason: 'capture returned an empty image (the app window may be hidden or minimized)',
      },
    };
  }
  const resized =
    image.getSize().width > MAX_SCREENSHOT_WIDTH
      ? image.resize({width: MAX_SCREENSHOT_WIDTH})
      : image;
  return {
    content: [
      {
        type: 'text',
        text: `${target.deviceName} (${target.width}x${target.height}) — ${target.url}`,
      },
      {
        type: 'image',
        data: resized.toJPEG(SCREENSHOT_JPEG_QUALITY).toString('base64'),
        mimeType: 'image/jpeg',
      },
    ],
  };
};

export const registerTools = (server: McpServer, getMainWindow: GetMainWindow) => {
  server.registerTool('get_app_state', toolDefs.get_app_state, async () => {
    try {
      const state = await sendBridgeCommand<McpAppState>(getMainWindow, 'get-app-state');
      return textResult(state);
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool('navigate', toolDefs.navigate, async ({url}) => {
    try {
      const normalizedUrl = normalizeUrl(url);
      const result = await sendBridgeCommand<McpNavigateResult>(
        getMainWindow,
        'navigate',
        {url: normalizedUrl},
        NAVIGATE_BRIDGE_TIMEOUT_MS
      );
      return textResult(result);
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool('list_devices', toolDefs.list_devices, async () => {
    try {
      const devices = await sendBridgeCommand<McpDeviceInfo[]>(getMainWindow, 'list-devices');
      return textResult(devices);
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool('set_active_devices', toolDefs.set_active_devices, async ({devices}) => {
    try {
      const result = await sendBridgeCommand<McpSetActiveDevicesResult>(
        getMainWindow,
        'set-active-devices',
        {devices}
      );
      return textResult(result);
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool('read_page', toolDefs.read_page, async ({device}) => {
    try {
      return textResult(await readPage(getMainWindow, device));
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool('click', toolDefs.click, async ({selector, device}) => {
    try {
      return textResult(await clickElement(getMainWindow, selector, device));
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool(
    'type_text',
    toolDefs.type_text,
    async ({text, selector, clear, pressEnter, device}) => {
      try {
        return textResult(
          await typeText(getMainWindow, {text, selector, clear, pressEnter, device})
        );
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool('screenshot', toolDefs.screenshot, async ({device}) => {
    try {
      const {targets, skipped} = await sendBridgeCommand<McpCaptureTargetsResult>(
        getMainWindow,
        'get-capture-targets',
        {device}
      );
      if (targets.length === 0 && skipped.length === 0) {
        return errorResult(
          new Error('No active devices to capture. Use the set_active_devices tool first.')
        );
      }
      const captures = await Promise.all(targets.map(captureTarget));
      const content: Array<TextContent | ImageContent> = [];
      const skips: McpSkippedCapture[] = [...skipped];
      captures.forEach((capture) => {
        if ('skip' in capture) {
          skips.push(capture.skip);
        } else {
          content.push(...capture.content);
        }
      });
      if (skips.length > 0) {
        content.push({
          type: 'text',
          text: `Skipped: ${skips.map((s) => `${s.deviceName} (${s.reason})`).join('; ')}`,
        });
      }
      return {content};
    } catch (error) {
      return errorResult(error);
    }
  });
};
