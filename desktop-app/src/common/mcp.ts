import type {PreviewLayout} from './constants';

export const DEFAULT_MCP_PORT = 12720;

export const MCP_PORT_ENV_VAR = 'RESPONSIVELY_MCP_PORT';

export const MCP_SERVER_NAME = 'responsively';

export type McpBridgeCommand =
  | 'get-app-state'
  | 'navigate'
  | 'list-devices'
  | 'set-active-devices'
  | 'get-capture-targets';

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
