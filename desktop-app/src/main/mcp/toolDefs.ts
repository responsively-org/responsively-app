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
      'factor, and active devices with effective viewport dimensions, orientation, color ' +
      'scheme, and whether each device participates in event mirroring.',
  },
  navigate: {
    description:
      'Open a website URL across all active browser viewports in Responsively App for ' +
      'responsive testing on mobile, tablet, and desktop. Accepts http(s) URLs and file:// URLs of local .html/.htm files; ' +
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
  set_mirroring: {
    description:
      'Enable or disable event mirroring for all active previews, or one device by id or ' +
      'exact name. A disabled preview neither sends nor receives mirrored website clicks, ' +
      'typing, and scrolling. Disable mirroring on a device before interacting with it ' +
      'to test it independently. Settings are shared with the Event mirroring UI control, ' +
      'survive page navigation during this app session, and do not reload the page. ' +
      'Returns the active devices and their current settings. Explicit app commands such ' +
      'as navigate still act on their documented device scope.',
    inputSchema: {
      enabled: z.boolean().describe('Whether previews participate in event mirroring'),
      device: z
        .string()
        .trim()
        .min(1)
        .optional()
        .describe('Device id or exact name; omit to change all active devices'),
    },
  },
  set_device_options: {
    description:
      'Set session-only viewport options for one active device in Responsively App. ' +
      'Accepts arbitrary CSS-pixel width and height, portrait/landscape orientation, and ' +
      'light/dark/system color scheme. Omitted fields keep their current setting. Explicit ' +
      'geometry overrides take precedence over the global Rotate setting; orientation ' +
      'normalizes the resulting dimensions. System clears the per-device color override ' +
      'and follows the app global device theme. Use reset to restore the preset under ' +
      'the current global rotation/theme, optionally applying new options afterward. ' +
      'Does not modify the saved device catalog or reload the page. Defaults to the primary ' +
      'device. Returns the device with its effective settings and viewportApplied. Hidden ' +
      'previews save the settings with viewportApplied=false and resize when shown again.',
    inputSchema: {
      device: z
        .string()
        .trim()
        .min(1)
        .optional()
        .describe('Device id or exact name; omit for the primary device'),
      width: z
        .number()
        .int()
        .min(1)
        .max(10000)
        .optional()
        .describe('Viewport width in CSS pixels (1–10000)'),
      height: z
        .number()
        .int()
        .min(1)
        .max(10000)
        .optional()
        .describe('Viewport height in CSS pixels (1–10000)'),
      orientation: z
        .enum(['portrait', 'landscape'])
        .optional()
        .describe('Normalize dimensions to portrait or landscape'),
      colorScheme: z
        .enum(['light', 'dark', 'system'])
        .optional()
        .describe('Per-device preferred color scheme; system follows the global device theme'),
      reset: z
        .boolean()
        .optional()
        .describe(
          'Clear this device’s session viewport options and individual rotation before applying supplied fields'
        ),
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
  screenshot: {
    description:
      'Capture browser screenshots to evaluate website responsiveness across mobile, tablet, ' +
      'and desktop viewports in Responsively App. Use for visual responsive audits, comparing ' +
      'page layouts across screen sizes, and spotting clipping or awkward wrapping. Returns ' +
      'one labeled image per active device in one call, or a single device specified by id or ' +
      'exact name. Defaults to visible-viewport JPEGs downscaled to at most 1000px wide. ' +
      'Set fullPage to capture the entire document and originalResolution to return an ' +
      'unscaled, lossless PNG. Choose devices with list_devices and set_active_devices, then ' +
      'load the website with navigate before capturing. Full-page captures include currently ' +
      'rendered content; scroll first to load lazy content when needed.',
    inputSchema: {
      device: z
        .string()
        .optional()
        .describe('Optional device id or exact name; omit to capture all active devices'),
      fullPage: z
        .boolean()
        .optional()
        .describe('Capture the full document instead of the visible viewport (default false)'),
      originalResolution: z
        .boolean()
        .optional()
        .describe('Return an unscaled PNG instead of a JPEG capped at 1000px wide (default false)'),
    },
  },
  scroll_to: {
    description:
      'Scroll a Responsively App browser preview to a CSS selector, visible page text, or ' +
      'absolute page coordinates in CSS pixels. Supply exactly one target: selector, text, ' +
      'or x/y. Text matching ignores case and normalizes whitespace; ambiguous matches return ' +
      'an error so you can refine the text or use a unique selector. Element targets also ' +
      'scroll nested containers. Returns the resulting scroll position, page dimensions, ' +
      'and matched element. Defaults to the primary device. Page scrolling may mirror across ' +
      'previews according to the app settings. Use screenshot afterward to inspect the section.',
    inputSchema: {
      selector: z
        .string()
        .trim()
        .min(1)
        .optional()
        .describe('Unique CSS selector to scroll into view'),
      text: z.string().trim().min(1).optional().describe('Visible page text to scroll into view'),
      x: z.number().min(0).optional().describe('Absolute horizontal scroll position in CSS pixels'),
      y: z.number().min(0).optional().describe('Absolute vertical scroll position in CSS pixels'),
      exact: z
        .boolean()
        .optional()
        .describe('Match the entire normalized text (default false; text targets only)'),
      block: z
        .enum(['start', 'center', 'end', 'nearest'])
        .optional()
        .describe('Vertical alignment for an element target (default center)'),
      device: z
        .string()
        .optional()
        .describe('Optional device id or exact name; omit to scroll the primary device'),
    },
  },
};

export type ToolName = keyof typeof toolDefs;
