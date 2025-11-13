/* eslint-disable  import/prefer-default-export */

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

export type PreviewLayout =
  (typeof PREVIEW_LAYOUTS)[keyof typeof PREVIEW_LAYOUTS];

export type Notification = {
  id: string;
  link?: string;
  linkText?: string;
  text: string;
};

export interface OpenUrlArgs {
  url: string;
}

export const BROWSER_SYNC_PORT = 12719;
export const BROWSER_SYNC_HOST = `localhost:${BROWSER_SYNC_PORT}`;
export const BROWSER_SYNC_URL = `https://${BROWSER_SYNC_HOST}/browser-sync/browser-sync-client.js`;

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
} as const;

export type Channels =
  (typeof IPC_MAIN_CHANNELS)[keyof typeof IPC_MAIN_CHANNELS];

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

export type PermissionType =
  typeof PERMISSION_TYPES[keyof typeof PERMISSION_TYPES];

export interface SitePermission {
  type: string;
  state: 'GRANTED' | 'DENIED' | 'PROMPT' | 'UNKNOWN';
  displayName: string;
  icon: string;
}
