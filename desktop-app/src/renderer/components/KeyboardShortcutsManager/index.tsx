import {SHORTCUT_KEYS, ShortcutChannel} from './constants';
import useMousetrapEmitter from './useMousetrapEmitter';

const KeyboardShortcutsManager = () => {
  for (const [channel, keys] of Object.entries(SHORTCUT_KEYS)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMousetrapEmitter(keys, channel as ShortcutChannel);
  }

  return null;
};

export default KeyboardShortcutsManager;
