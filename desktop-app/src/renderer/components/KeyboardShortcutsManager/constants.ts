export const SHORTCUT_CHANNEL = {
  ZOOM_IN: 'ZOOM_IN',
  ZOOM_OUT: 'ZOOM_OUT',
} as const;

export type ShortcutChannel =
  typeof SHORTCUT_CHANNEL[keyof typeof SHORTCUT_CHANNEL];
