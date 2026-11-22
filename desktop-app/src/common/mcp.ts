import type {PreviewLayout} from './constants';

export const DEFAULT_MCP_PORT = 12720;

export const MCP_PORT_ENV_VAR = 'RESPONSIVELY_MCP_PORT';

export const MCP_SERVER_NAME = 'responsively';

// Shared by the HTTP server and stdio bridge so either connection advertises
// the same capabilities during MCP initialization.
export const MCP_SERVER_INFO = {
  name: MCP_SERVER_NAME,
  title: 'Responsively App — Responsive Browser Testing',
  description:
    'Browser automation for testing website responsiveness across mobile, tablet, and ' +
    'desktop viewports. Open a URL in multiple device previews, compare labeled screenshots, ' +
    'read page content, and test website interactions in Responsively App.',
  websiteUrl: 'https://responsively.app',
};

export const MCP_SERVER_INSTRUCTIONS =
  'Use Responsively App for responsive website testing and visual comparisons across ' +
  'browser screen sizes. Start with get_app_state to inspect the current URL and viewports. ' +
  'Choose mobile, tablet, and desktop presets with list_devices and set_active_devices, ' +
  'open the website with navigate, then use screenshot to capture all active viewports in ' +
  'one call. Use set_mirroring to isolate one preview or enable shared interactions, and ' +
  'set_device_options to test custom viewport sizes, orientation, and color scheme without ' +
  'changing saved device presets. get_app_state reports the effective settings. ' +
  'Use read_page to find selectors for click and type_text when testing menus, ' +
  'links, and forms. Use scroll_to with a selector, text, or x/y coordinates to inspect ' +
  'content below the fold. Screenshots default to labeled viewport JPEGs capped at 1000px ' +
  'wide; set fullPage for the entire document and originalResolution for unscaled PNGs. ' +
  'Full-page captures include currently rendered content; scroll first to load lazy content. ' +
  'These are browser device previews, ' +
  'not physical-device tests.';

export const MCP_BEACON_FILENAME = 'app-location.json';

/**
 * Written to <userData>/app-location.json at every app startup so the
 * @responsively/mcp npm bootstrap can locate this install (and its bundled
 * MCP bridge) without any user configuration.
 */
export interface McpBeacon {
  binaryPath: string;
  resourcesPath?: string;
  bridgeEntry?: string;
  version: string;
  mcpPort: number;
  writtenAt: string;
}

export type McpBridgeCommand =
  | 'get-app-state'
  | 'navigate'
  | 'list-devices'
  | 'set-active-devices'
  | 'get-capture-targets'
  | 'set-mirroring'
  | 'set-device-options';

export interface McpBridgeRequest {
  requestId: string;
  command: McpBridgeCommand;
  payload?: unknown;
}

export interface McpBridgeResponse {
  requestId: string;
  ok: boolean;
  result?: unknown;
  error?: string;
}

export interface McpActiveDevice {
  id: string;
  name: string;
  width: number;
  height: number;
  type: string;
  orientation: 'portrait' | 'landscape';
  colorScheme: 'light' | 'dark' | 'system';
  mirroringEnabled: boolean;
}

export interface McpAppState {
  url: string;
  pageTitle: string;
  layout: PreviewLayout;
  zoomFactor: number;
  activeSuite: string;
  activeDevices: McpActiveDevice[];
}

export interface McpDeviceInfo extends Omit<
  McpActiveDevice,
  'orientation' | 'colorScheme' | 'mirroringEnabled'
> {
  isCustom: boolean;
  isActive: boolean;
}

export interface McpNavigatePayload {
  url: string;
}

export interface McpNavigateResult {
  url: string;
  pageTitle: string;
  loaded: boolean;
}

export interface McpSetActiveDevicesPayload {
  devices: string[];
}

export interface McpSetActiveDevicesResult {
  activeDevices: McpActiveDevice[];
}

export interface McpSetMirroringPayload {
  enabled: boolean;
  device?: string;
}

export interface McpSetMirroringResult {
  activeDevices: McpActiveDevice[];
}

export interface McpSetDeviceOptionsPayload {
  device?: string;
  width?: number;
  height?: number;
  orientation?: 'portrait' | 'landscape';
  colorScheme?: 'light' | 'dark' | 'system';
  reset?: boolean;
}

export interface McpSetDeviceOptionsResult {
  device: McpActiveDevice;
  /** Hidden previews apply their geometry when shown again. */
  viewportApplied: boolean;
}

export interface McpCaptureTargetsPayload {
  device?: string;
}

export interface McpCaptureTarget {
  deviceName: string;
  width: number;
  height: number;
  webContentsId: number;
  url: string;
}

export interface McpSkippedCapture {
  deviceName: string;
  reason: string;
}

export interface McpCaptureTargetsResult {
  targets: McpCaptureTarget[];
  skipped: McpSkippedCapture[];
}
