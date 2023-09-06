export const HORIZONTAL_LAYOUT = 'HORIZONTAL';
export const FLEXIGRID_LAYOUT = 'FLEXIGRID';
export const INDIVIDUAL_LAYOUT = 'INDIVIDUAL';

export const DEVTOOLS_MODES = {
  BOTTOM: 'BOTTOM',
  RIGHT: 'RIGHT',
  UNDOCKED: 'UNDOCKED',
};

export const CSS_EDITOR_MODES = {
  BOTTOM: 'BOTTOM',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  TOP: 'TOP',
  UNDOCKED: 'UNDOCKED',
};

export const isVeriticallyStacked = mode =>
  mode === CSS_EDITOR_MODES.LEFT || mode === CSS_EDITOR_MODES.RIGHT;

export const isHorizontallyStacked = mode =>
  mode === CSS_EDITOR_MODES.TOP || mode === CSS_EDITOR_MODES.BOTTOM;
