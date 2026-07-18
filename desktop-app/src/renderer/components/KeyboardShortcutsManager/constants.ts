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

export type ShortcutBindings = {[key in ShortcutChannel]: string[]};
export type ShortcutOverrides = Partial<ShortcutBindings>;

export const SHORTCUT_KEYS: ShortcutBindings = {
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

export const NON_CUSTOMIZABLE_SHORTCUT_CHANNELS: ShortcutChannel[] = [SHORTCUT_CHANNEL.RELOAD];

export const CUSTOMIZABLE_SHORTCUT_CHANNELS: ShortcutChannel[] = Object.values(
  SHORTCUT_CHANNEL
).filter((channel) => !NON_CUSTOMIZABLE_SHORTCUT_CHANNELS.includes(channel));

export const SHORTCUT_CATEGORIES: {
  id: number;
  name: string;
  channels: ShortcutChannel[];
}[] = [
  {
    id: 0,
    name: 'General Shortcuts',
    channels: [
      SHORTCUT_CHANNEL.BACK,
      SHORTCUT_CHANNEL.BOOKMARK,
      SHORTCUT_CHANNEL.DELETE_ALL,
      SHORTCUT_CHANNEL.DELETE_CACHE,
      SHORTCUT_CHANNEL.DELETE_COOKIES,
      SHORTCUT_CHANNEL.DELETE_STORAGE,
      SHORTCUT_CHANNEL.EDIT_URL,
    ],
  },
  {
    id: 1,
    name: 'Previewer Shortcuts',
    channels: [
      SHORTCUT_CHANNEL.FORWARD,
      SHORTCUT_CHANNEL.INSPECT_ELEMENTS,
      SHORTCUT_CHANNEL.PREVIEW_LAYOUT,
      SHORTCUT_CHANNEL.RELOAD,
      SHORTCUT_CHANNEL.ROTATE_ALL,
      SHORTCUT_CHANNEL.SCREENSHOT_ALL,
      SHORTCUT_CHANNEL.THEME,
      SHORTCUT_CHANNEL.TOGGLE_RULERS,
      SHORTCUT_CHANNEL.ZOOM_IN,
      SHORTCUT_CHANNEL.ZOOM_OUT,
    ],
  },
];

export const resolveShortcutBindings = (overrides: ShortcutOverrides = {}): ShortcutBindings => {
  return (Object.keys(SHORTCUT_KEYS) as ShortcutChannel[]).reduce((bindings, channel) => {
    bindings[channel] = overrides[channel] ?? SHORTCUT_KEYS[channel];
    return bindings;
  }, {} as ShortcutBindings);
};
