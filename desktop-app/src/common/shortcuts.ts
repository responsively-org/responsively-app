export const SHORTCUT_CHANNEL = {
  BACK: 'BACK',
  BOOKMARK: 'BOOKMARK',
  DELETE_ALL: 'DELETE_ALL',
  DELETE_CACHE: 'DELETE_CACHE',
  DELETE_COOKIES: 'DELETE_COOKIES',
  DELETE_STORAGE: 'DELETE_STORAGE',
  EDIT_URL: 'EDIT_URL',
  FORWARD: 'FORWARD',
  INSPECT_ELEMENTS: 'INSPECT_ELEMENTS',
  PREVIEW_LAYOUT: 'PREVIEW_LAYOUT',
  RELOAD: 'RELOAD',
  ROTATE_ALL: 'ROTATE_ALL',
  SCREENSHOT_ALL: 'SCREENSHOT_ALL',
  THEME: 'THEME',
  TOGGLE_RULERS: 'TOGGLE_RULERS',
  ZOOM_IN: 'ZOOM_IN',
  ZOOM_OUT: 'ZOOM_OUT',
} as const;

export type ShortcutChannel = (typeof SHORTCUT_CHANNEL)[keyof typeof SHORTCUT_CHANNEL];

/** Mousetrap-style accelerators; `mod` is Cmd on macOS and Ctrl elsewhere. */
export const SHORTCUT_KEYS: {[key in ShortcutChannel]: string[]} = {
  [SHORTCUT_CHANNEL.BACK]: ['alt+left'],
  [SHORTCUT_CHANNEL.BOOKMARK]: ['mod+d'],
  [SHORTCUT_CHANNEL.DELETE_ALL]: ['mod+alt+del', 'mod+alt+backspace'],
  [SHORTCUT_CHANNEL.DELETE_CACHE]: ['mod+alt+z'],
  [SHORTCUT_CHANNEL.DELETE_COOKIES]: ['mod+alt+a'],
  [SHORTCUT_CHANNEL.DELETE_STORAGE]: ['mod+alt+q'],
  [SHORTCUT_CHANNEL.EDIT_URL]: ['mod+l'],
  [SHORTCUT_CHANNEL.FORWARD]: ['alt+right'],
  [SHORTCUT_CHANNEL.INSPECT_ELEMENTS]: ['mod+i'],
  [SHORTCUT_CHANNEL.PREVIEW_LAYOUT]: ['mod+shift+l'],
  [SHORTCUT_CHANNEL.RELOAD]: ['mod+r'],
  [SHORTCUT_CHANNEL.ROTATE_ALL]: ['mod+alt+r'],
  [SHORTCUT_CHANNEL.SCREENSHOT_ALL]: ['mod+s'],
  [SHORTCUT_CHANNEL.THEME]: ['mod+t'],
  [SHORTCUT_CHANNEL.TOGGLE_RULERS]: ['alt+r'],
  [SHORTCUT_CHANNEL.ZOOM_IN]: ['mod+=', 'mod++', 'mod+shift+='],
  [SHORTCUT_CHANNEL.ZOOM_OUT]: ['mod+-'],
};

interface ParsedCombo {
  mod: boolean;
  alt: boolean;
  shift: boolean;
  /** KeyboardEvent.code of the non-modifier key. */
  code: string;
}

// Physical-key codes, not characters: on macOS alt+r types '®' and shift+=
// reports '+', so matching on `key` would miss both.
const CODE_BY_KEY_NAME: Record<string, string> = {
  del: 'Delete',
  backspace: 'Backspace',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  '=': 'Equal',
  '+': 'Equal',
  '-': 'Minus',
};

const codeForKeyName = (keyName: string): string => {
  const mapped = CODE_BY_KEY_NAME[keyName];
  if (mapped !== undefined) {
    return mapped;
  }
  if (/^[a-z]$/.test(keyName)) {
    return `Key${keyName.toUpperCase()}`;
  }
  if (/^[0-9]$/.test(keyName)) {
    return `Digit${keyName}`;
  }
  return keyName;
};

/**
 * Splits a Mousetrap combo. '+' is both the separator and a key name, so a
 * trailing '++' means the plus key itself.
 */
export const parseCombo = (combo: string): ParsedCombo => {
  let rest = combo;
  let keyName: string;
  if (rest.endsWith('++')) {
    keyName = '+';
    rest = rest.slice(0, -2);
  } else {
    const lastPlus = rest.lastIndexOf('+');
    keyName = lastPlus === -1 ? rest : rest.slice(lastPlus + 1);
    rest = lastPlus === -1 ? '' : rest.slice(0, lastPlus);
  }
  const modifiers = rest.split('+').filter(Boolean);
  return {
    mod: modifiers.includes('mod'),
    alt: modifiers.includes('alt'),
    shift: modifiers.includes('shift'),
    code: codeForKeyName(keyName),
  };
};

export interface ShortcutInput {
  code: string;
  control: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

/**
 * Maps a raw key event to an app shortcut. Used in the main process to route
 * keystrokes that land inside a preview webview, where the renderer's own
 * handlers never see them (bug #1175).
 */
export const matchShortcut = (
  input: ShortcutInput,
  platform: NodeJS.Platform
): ShortcutChannel | null => {
  const modPressed = platform === 'darwin' ? input.meta : input.control;

  for (const [channel, combos] of Object.entries(SHORTCUT_KEYS)) {
    for (const combo of combos) {
      const parsed = parseCombo(combo);
      if (
        parsed.code === input.code &&
        parsed.mod === modPressed &&
        parsed.alt === input.alt &&
        parsed.shift === input.shift
      ) {
        return channel as ShortcutChannel;
      }
    }
  }
  return null;
};
