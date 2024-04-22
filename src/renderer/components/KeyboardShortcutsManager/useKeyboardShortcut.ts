import { useEffect } from 'react';
import { ShortcutChannel } from './constants';
import { keyboardShortcutsPubsub } from './useMousetrapEmitter';

const useKeyboardShortcut = (
  eventChannel: ShortcutChannel,
  callback: () => void
) => {
  useEffect(() => {
    keyboardShortcutsPubsub.subscribe(eventChannel, callback);
    return () => {
      keyboardShortcutsPubsub.unsubscribe(eventChannel, callback);
    };
  }, [eventChannel, callback]);
  return null;
};

export default useKeyboardShortcut;
export * from './constants';
