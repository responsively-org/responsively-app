import {z} from 'zod';

/**
 * Pure tool metadata (descriptions + zod input shapes) shared by the live
 * server (tools.ts) and the manifest build script that runs OUTSIDE Electron
 * (.erb/scripts/generate-mcp-manifest.ts). This module must only ever import
 * zod — never electron or anything that does.
 */
export const toolDefs = {
  get_app_state: {
    description:
      'Inspect the browser viewports currently open in Responsively App before checking ' +
      'website responsiveness. Returns the loaded URL, page title, preview layout, zoom ' +
      'factor, and active devices with their viewport dimensions.',
  },
  navigate: {
    description:
      'Open a website URL across all active browser viewports in Responsively App for ' +
      'responsive testing on mobile, tablet, and desktop. Accepts http(s) and file:// URLs; ' +
      'bare domains get https:// prepended (localhost gets http://). Waits for the page to ' +
      'finish loading (up to 30s) before returning the final URL and page title. Use ' +
      'screenshot afterward to compare layouts across screen sizes.',
    inputSchema: {url: z.string().min(1).describe('The URL to load in every device preview')},
  },
  list_devices: {
    description:
      'List mobile phone, tablet, laptop, and desktop browser viewport presets for responsive ' +
      'website testing in Responsively App, including user-defined custom devices. Returns ' +
      'id, name, dimensions, type, and whether each device is active. Use these ids or exact ' +
      'names with set_active_devices to choose screen sizes for screenshot comparisons.',
  },
  set_active_devices: {
    description:
      'Configure mobile, tablet, laptop, and desktop browser viewports for responsive layout ' +
      'testing and screenshot comparisons in Responsively App. Replaces the active device ' +
      'previews using ids or exact names from list_devices; every preview loads the current ' +
      'URL. Then use navigate to load a website and screenshot to compare its layouts.',
    inputSchema: {
      devices: z
        .array(z.string())
        .min(1)
        .describe('Device ids or exact device names to show, e.g. ["10008", "iPad Pro"]'),
    },
  },
  read_page: {
    description:
      'Read website text and interactive elements in a Responsively App browser viewport ' +
      'to inspect content and test navigation or forms at different screen sizes. Returns ' +
      'page text plus links, buttons, and form fields with CSS selectors for click and ' +
      'type_text. Defaults to the primary (first) device preview.',
    inputSchema: {
      device: z
        .string()
        .optional()
        .describe('Optional device id or exact name; omit to read the primary device'),
    },
  },
  click: {
    description:
      'Click website links, buttons, and menus in a Responsively App browser viewport to ' +
      'test responsive page interactions. Uses a real (trusted) mouse event at the element ' +
      'center after scrolling it into view. With event mirroring enabled (the app default), ' +
      'the click replicates across all device previews. Use read_page to discover selectors. ' +
      'Returns the URL and title after the click.',
    inputSchema: {
      selector: z.string().min(1).describe('CSS selector of the element to click'),
      device: z
        .string()
        .optional()
        .describe('Optional device id or exact name; omit to click in the primary device'),
    },
  },
  type_text: {
    description:
      'Type into website form fields in a Responsively App browser viewport to test forms ' +
      'at different responsive screen sizes. Uses real keystrokes and focuses the element ' +
      'first (or uses the currently focused element when no selector is given). Use ' +
      'read_page to discover selectors. Returns the field value plus URL and title after typing.',
    inputSchema: {
      text: z.string().describe('The text to type'),
      selector: z
        .string()
        .optional()
        .describe('CSS selector of the field; omit to type into the focused element'),
      clear: z
        .boolean()
        .optional()
        .describe('Select the existing field content first so typing replaces it'),
      pressEnter: z.boolean().optional().describe('Press Enter after typing (submits forms)'),
      device: z
        .string()
        .optional()
        .describe('Optional device id or exact name; omit to type in the primary device'),
    },
  },
  set_javascript_enabled: {
    description:
      'Enable or disable JavaScript execution for one Responsively App device preview. ' +
      'Reloads that preview so the change takes effect; the state persists across further ' +
      'reloads and navigation until changed again or the device is removed from the preview.',
    inputSchema: {
      device: z.string().min(1).describe('Device id or exact name (use list_devices)'),
      enabled: z.boolean().describe('true to enable JavaScript, false to disable it'),
    },
  },
  set_network_scripts_blocked: {
    description:
      'Block or unblock JavaScript network requests for one Responsively App device preview, ' +
      'without disabling the JavaScript engine itself. Distinct from set_javascript_enabled: ' +
      'the page can still execute inline or already-loaded scripts, but any request Chromium ' +
      'classifies as a script (any <script src>, any source) is cancelled at the network layer ' +
      '— closer to an ad-blocker, corporate firewall, or a dead CDN than a no-JS browser. ' +
      'Reloads that preview so the change takes effect; the state persists across further ' +
      'reloads and navigation until changed again or the device is removed from the preview.',
    inputSchema: {
      device: z.string().min(1).describe('Device id or exact name (use list_devices)'),
      blocked: z.boolean().describe('true to block script network requests, false to allow them'),
    },
  },
  screenshot: {
    description:
      'Capture browser screenshots to evaluate website responsiveness across mobile, tablet, ' +
      'and desktop viewports in Responsively App. Use for visual responsive audits, comparing ' +
      'page layouts across screen sizes, and spotting clipping or awkward wrapping. Returns ' +
      'one labeled JPEG per active device in one call, or a single device specified by id or ' +
      'exact name. Captures only the visible viewport, not the full page, and downscales images ' +
      'to at most 1000px wide. Choose devices with list_devices and set_active_devices, then ' +
      'load the website with navigate before capturing.',
    inputSchema: {
      device: z
        .string()
        .optional()
        .describe('Optional device id or exact name; omit to capture all active devices'),
    },
  },
};

export type ToolName = keyof typeof toolDefs;
