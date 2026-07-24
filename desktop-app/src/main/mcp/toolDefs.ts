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
      'Get the current state of Responsively App: the URL loaded in the device previews, ' +
      'the page title, preview layout, zoom factor, and the active devices with their dimensions.',
  },
  navigate: {
    description:
      'Navigate all Responsively App device previews to a URL. Accepts http(s) and file:// ' +
      'URLs; bare domains get https:// prepended (localhost gets http://). Waits for the page ' +
      'to finish loading (up to 30s) before returning the final URL and page title.',
    inputSchema: {url: z.string().min(1).describe('The URL to load in every device preview')},
  },
  list_devices: {
    description:
      'List every device available in Responsively App (phones, tablets, laptops, desktops ' +
      'and user-defined custom devices). Returns id, name, dimensions, type, and whether each ' +
      'device is currently active in the preview.',
  },
  set_active_devices: {
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
  read_page: {
    description:
      'Read the page rendered in a Responsively App device preview: the page text plus its ' +
      'interactive elements (links, buttons, form fields) with CSS selectors usable with the ' +
      'click and type_text tools. Defaults to the primary (first) device preview.',
    inputSchema: {
      device: z
        .string()
        .optional()
        .describe('Optional device id or exact name; omit to read the primary device'),
    },
  },
  click: {
    description:
      'Click an element in a Responsively App device preview using a real (trusted) mouse ' +
      'event at the element center; the element is scrolled into view first. With event ' +
      'mirroring enabled (the app default), the click replicates across all device previews. ' +
      'Use read_page to discover selectors. Returns the URL and title after the click.',
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
      'Type text into a form field in a Responsively App device preview using real ' +
      'keystrokes. Focuses the element first (or uses the currently focused element when no ' +
      'selector is given). Returns the field value plus URL and title after typing.',
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
  screenshot: {
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
};

export type ToolName = keyof typeof toolDefs;
