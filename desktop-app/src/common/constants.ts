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
