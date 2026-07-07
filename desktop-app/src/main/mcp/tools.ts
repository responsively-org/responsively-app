import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {webContents} from 'electron';
import {z} from 'zod';
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
  server.registerTool(
    'get_app_state',
    {
      description:
        'Get the current state of Responsively App: the URL loaded in the device previews, ' +
        'the page title, preview layout, zoom factor, and the active devices with their dimensions.',
    },
    async () => {
      try {
        const state = await sendBridgeCommand<McpAppState>(getMainWindow, 'get-app-state');
        return textResult(state);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'navigate',
    {
      description:
        'Navigate all Responsively App device previews to a URL. Accepts http(s) and file:// ' +
        'URLs; bare domains get https:// prepended (localhost gets http://). Waits for the page ' +
        'to finish loading (up to 30s) before returning the final URL and page title.',
      inputSchema: {url: z.string().min(1).describe('The URL to load in every device preview')},
    },
    async ({url}) => {
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
    }
  );

  server.registerTool(
    'list_devices',
    {
      description:
        'List every device available in Responsively App (phones, tablets, laptops, desktops ' +
        'and user-defined custom devices). Returns id, name, dimensions, type, and whether each ' +
        'device is currently active in the preview.',
    },
    async () => {
      try {
        const devices = await sendBridgeCommand<McpDeviceInfo[]>(getMainWindow, 'list-devices');
        return textResult(devices);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    'set_active_devices',
    {
      description:
        'Replace the set of device previews shown in Responsively App. Accepts device ids or ' +
        'exact device names (use list_devices to discover them). Every preview loads the ' +
        'current URL.',
      inputSchema: {
        devices: z
          .array(z.string())
          .min(1)
          .describe('Device ids or exact device names to show, e.g. ["10008", "iPad Pro"]'),
      },
    },
    async ({devices}) => {
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
    }
  );

  server.registerTool(
    'screenshot',
    {
      description:
        'Capture screenshots of Responsively App device previews rendering the current page. ' +
        'Returns one labeled JPEG per active device, or a single device if specified by id or ' +
        'name. Screenshots show the visible viewport and are downscaled to at most 1000px wide.',
      inputSchema: {
        device: z
          .string()
          .optional()
          .describe('Optional device id or exact name; omit to capture all active devices'),
      },
    },
    async ({device}) => {
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
    }
  );
};
