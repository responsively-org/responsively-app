export const DOCK_POSITION = {
  BOTTOM: 'BOTTOM',
  RIGHT: 'RIGHT',
  UNDOCKED: 'UNDOCKED',
} as const;

export const PREVIEW_LAYOUTS = {
  COLUMN: 'COLUMN',
  FLEX: 'FLEX',
  INDIVIDUAL: 'INDIVIDUAL',
  MASONRY: 'MASONRY',
} as const;

export type PreviewLayout = (typeof PREVIEW_LAYOUTS)[keyof typeof PREVIEW_LAYOUTS];

export type Notification = {
  id: string;
  link?: string;
  linkText?: string;
  text: string;
};

export interface OpenUrlArgs {
  url: string;
}

export const IPC_MAIN_CHANNELS = {
  APP_META: 'app-meta',
  PERMISSION_REQUEST: 'permission-request',
  PERMISSION_RESPONSE: 'permission-response',
  AUTH_REQUEST: 'auth-request',
  AUTH_RESPONSE: 'auth-response',
  OPEN_EXTERNAL: 'open-external',
  OPEN_URL: 'open-url',
  START_WATCHING_FILE: 'start-watching-file',
  STOP_WATCHER: 'stop-watcher',
  OPEN_ABOUT_DIALOG: 'open-about-dialog',
  GET_SITE_PERMISSIONS: 'get-site-permissions',
  UPDATE_SITE_PERMISSION: 'update-site-permission',
  CLEAR_SITE_PERMISSIONS: 'clear-site-permissions',
  PERMISSION_UPDATED: 'permission-updated',
  MCP_COMMAND: 'mcp-command',
  MCP_COMMAND_RESPONSE: 'mcp-command-response',
  SCREENSHOT: 'screenshot',
  SCREENSHOT_ALL: 'screenshot:All',
  OPEN_DEVTOOLS: 'open-devtools',
  RESIZE_DEVTOOLS: 'resize-devtools',
  CLOSE_DEVTOOLS: 'close-devtools',
  ENABLE_INSPECTOR_OVERLAY: 'enable-inspector-overlay',
  DISABLE_INSPECTOR_OVERLAY: 'disable-inspector-overlay',
  INSPECT_ELEMENT: 'inspect-element',
  DELETE_STORAGE: 'delete-storage',
  LOAD_URL_IN_WEBVIEW: 'load-url-in-webview',
  SET_NATIVE_THEME: 'set-native-theme',
  COPY_TO_CLIPBOARD: 'copy-to-clipboard',
  GET_BROWSER_SYNC_PORT: 'get-browser-sync-port',
  ELECTRON_STORE_GET: 'electron-store-get',
  ELECTRON_STORE_SET: 'electron-store-set',
  GET_ABOUT_INFO: 'get-about-info',
  SHORTCUT_TRIGGERED: 'shortcut-triggered',
} as const;

export type Channels = (typeof IPC_MAIN_CHANNELS)[keyof typeof IPC_MAIN_CHANNELS];

export const PROTOCOL = 'responsively';

export const PERMISSION_TYPES = {
  CAMERA: 'camera',
  MICROPHONE: 'microphone',
  LOCATION: 'geolocation',
  NOTIFICATIONS: 'notifications',
  CLIPBOARD: 'clipboard-read',
  FULLSCREEN: 'fullscreen',
  MIDI: 'midi',
  POINTER_LOCK: 'pointerLock',
} as const;

export type PermissionType = (typeof PERMISSION_TYPES)[keyof typeof PERMISSION_TYPES];

export interface SitePermission {
  type: string;
  state: 'GRANTED' | 'DENIED' | 'PROMPT' | 'UNKNOWN';
  displayName: string;
  icon: string;
}
