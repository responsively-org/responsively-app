import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  McpAppState,
  McpCaptureTargetsResult,
  McpDeviceInfo,
  McpNavigateResult,
  McpSetActiveDevicesResult,
  McpSetDeviceOptionsResult,
  McpSetMirroringResult,
  McpSkippedCapture,
} from '../../common/mcp';
import {GetMainWindow, sendBridgeCommand} from './bridge';
import {assertAllowedFileUrl, fileUrlRejection} from './file-url';
import {clickElement, readPage, typeText} from './interactions';
import {captureTarget, ImageContent, TextContent} from './screenshots';
import {scrollTo} from './scroll';
import {toolDefs} from './toolDefs';
import {normalizeUrl} from './utils';

const NAVIGATE_BRIDGE_TIMEOUT_MS = 35_000;

const textResult = (value: unknown) => ({
  content: [{type: 'text' as const, text: JSON.stringify(value, null, 2)}],
});

const errorResult = (error: unknown) => ({
  content: [{type: 'text' as const, text: error instanceof Error ? error.message : String(error)}],
  isError: true,
});

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
      // The original URL is loaded unchanged, so the address bar shows what
      // the agent asked for.
      assertAllowedFileUrl(normalizedUrl);
      const result = await sendBridgeCommand<McpNavigateResult>(
        getMainWindow,
        'navigate',
        {url: normalizedUrl},
        NAVIGATE_BRIDGE_TIMEOUT_MS
      );
      // A local .html page can redirect itself to another local file on load.
      const landedOn = fileUrlRejection(result.url);
      if (landedOn !== null) {
        throw new Error(
          `The page navigated to a local file that MCP tools can't access. ${landedOn}`
        );
      }
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

  server.registerTool('set_mirroring', toolDefs.set_mirroring, async (options) => {
    try {
      return textResult(
        await sendBridgeCommand<McpSetMirroringResult>(
          getMainWindow,
          'set-mirroring',
          options,
          20_000
        )
      );
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool('set_device_options', toolDefs.set_device_options, async (options) => {
    try {
      return textResult(
        await sendBridgeCommand<McpSetDeviceOptionsResult>(
          getMainWindow,
          'set-device-options',
          options,
          20_000
        )
      );
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

  server.registerTool('scroll_to', toolDefs.scroll_to, async (options) => {
    try {
      return textResult(await scrollTo(getMainWindow, options));
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool(
    'screenshot',
    toolDefs.screenshot,
    async ({device, fullPage, originalResolution}) => {
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
        const captures = await Promise.all(
          targets.map((target) => captureTarget(target, {fullPage, originalResolution}))
        );
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
        return {
          content,
          ...(captures.every((capture) => 'skip' in capture) ? {isError: true} : {}),
        };
      } catch (error) {
        return errorResult(error);
      }
    }
  );
};
