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
  'one call. Use read_page to find selectors for click and type_text when testing menus, ' +
  'links, and forms. Screenshots are labeled JPEGs of the visible viewport, not full-page ' +
  'captures, and are downscaled to at most 1000px wide. These are browser device previews, ' +
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
  | 'set-javascript-enabled'
  | 'set-network-scripts-blocked';

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
}

export interface McpAppState {
  url: string;
  pageTitle: string;
  layout: PreviewLayout;
  zoomFactor: number;
  activeSuite: string;
  activeDevices: McpActiveDevice[];
}

export interface McpDeviceInfo extends McpActiveDevice {
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

export interface McpSetJavascriptEnabledPayload {
  device: string;
  enabled: boolean;
}

export interface McpSetJavascriptEnabledResult {
  deviceName: string;
  enabled: boolean;
}

export interface McpSetNetworkScriptsBlockedPayload {
  device: string;
  blocked: boolean;
}

export interface McpSetNetworkScriptsBlockedResult {
  deviceName: string;
  blocked: boolean;
}
