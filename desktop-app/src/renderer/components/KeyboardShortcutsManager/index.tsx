import {IPC_MAIN_CHANNELS} from 'common/constants';
import {useEffect} from 'react';
import {SHORTCUT_KEYS, ShortcutChannel} from './constants';
import useMousetrapEmitter, {keyboardShortcutsPubsub} from './useMousetrapEmitter';

const KeyboardShortcutsManager = () => {
  for (const [channel, keys] of Object.entries(SHORTCUT_KEYS)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMousetrapEmitter(keys, channel as ShortcutChannel);
  }

  // Shortcuts typed inside a preview webview are matched in the main process
  // and forwarded here, since Mousetrap never sees guest key events.
  useEffect(() => {
    const unsubscribe = window.electron.ipcRenderer.on<ShortcutChannel>(
      IPC_MAIN_CHANNELS.SHORTCUT_TRIGGERED,
      (channel) => {
        keyboardShortcutsPubsub.publish(channel).catch((err) => {
          console.error('Forwarded shortcut failed', err);
        });
      }
    );
    return unsubscribe;
  }, []);

  return null;
};

export default KeyboardShortcutsManager;
