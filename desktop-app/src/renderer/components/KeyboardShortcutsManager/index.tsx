import { SHORTCUT_CHANNEL, ShortcutChannel } from './constants';
import useMousetrapEmitter from './useMousetrapEmitter';

const shortcuts: { [key in ShortcutChannel]: string[] } = {
  [SHORTCUT_CHANNEL.ZOOM_IN]: ['mod+=', 'mod++', 'mod+shift+='],
  [SHORTCUT_CHANNEL.ZOOM_OUT]: ['mod+-'],
};

const KeyboardShortcutsManager = () => {
  // eslint-disable-next-line no-restricted-syntax
  for (const [channel, keys] of Object.entries(shortcuts)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMousetrapEmitter(keys, channel as ShortcutChannel);
  }

  return null;
};

export default KeyboardShortcutsManager;
