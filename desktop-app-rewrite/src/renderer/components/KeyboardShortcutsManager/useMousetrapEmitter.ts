import { useEffect } from 'react';
import Mousetrap from 'mousetrap';
import PubSub from 'renderer/lib/pubsub';
import { ShortcutChannel } from './constants';

export const keyboardShortcutsPubsub = new PubSub();

const useMousetrapEmitter = (
  accelerator: string | string[],
  eventChannel: ShortcutChannel,
  action?: string | undefined
) => {
  useEffect(() => {
    const callback = async (
      _e: Mousetrap.ExtendedKeyboardEvent,
      _combo: string
    ) => {
      try {
        await keyboardShortcutsPubsub.publish(eventChannel);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('useMousetrapEmitter: callback: error: ', err);
      }
    };
    Mousetrap.bind(accelerator, callback, action);

    return () => {
      Mousetrap.unbind(accelerator, action);
    };
  }, [accelerator, eventChannel, action]);

  return null;
};

export default useMousetrapEmitter;
