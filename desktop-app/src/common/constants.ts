/* eslint-disable  import/prefer-default-export */

export const DOCK_POSITION = {
  BOTTOM: 'BOTTOM',
  RIGHT: 'RIGHT',
  UNDOCKED: 'UNDOCKED',
} as const;

export const PREVIEW_LAYOUTS = {
  COLUMN: 'COLUMN',
  FLEX: 'FLEX',
} as const;

export type PreviewLayout =
  typeof PREVIEW_LAYOUTS[keyof typeof PREVIEW_LAYOUTS];

export const IPC_MAIN_CHANNELS = {
  APP_META: 'app-meta',
  PERMISSION_REQUEST: 'permission-request',
  PERMISSION_RESPONSE: 'permission-response',
  AUTH_REQUEST: 'auth-request',
  AUTH_RESPONSE: 'auth-response',
  OPEN_EXTERNAL: 'open-external',
} as const;

export type Channels = typeof IPC_MAIN_CHANNELS[keyof typeof IPC_MAIN_CHANNELS];
