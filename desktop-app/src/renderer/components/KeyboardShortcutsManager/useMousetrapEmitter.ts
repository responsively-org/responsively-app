import {useEffect} from 'react';
import Mousetrap from 'mousetrap';
import PubSub from 'renderer/lib/pubsub';
import {ShortcutChannel} from './constants';

export const keyboardShortcutsPubsub = new PubSub();

// Mousetrap refuses to fire any shortcut while an <input>/<textarea> has
// focus, which silently disabled every app shortcut whenever the address bar
// was focused (zoom, reload, inspect...). Modifier combos never conflict with
// text entry — every shortcut we bind is a `mod+` combo — so let those
// through and keep the default guard for bare keys.
const defaultStopCallback = Mousetrap.prototype.stopCallback;
Mousetrap.prototype.stopCallback = function stopCallback(
  e: Mousetrap.ExtendedKeyboardEvent,
  element: Element,
  combo: string
): boolean {
  if (e.metaKey || e.ctrlKey) {
    return false;
  }
  return defaultStopCallback.call(this, e, element, combo);
};

const useMousetrapEmitter = (
  accelerator: string | string[],
  eventChannel: ShortcutChannel,
  action?: string | undefined
) => {
  useEffect(() => {
    const callback = (_e: Mousetrap.ExtendedKeyboardEvent, _combo: string) => {
      keyboardShortcutsPubsub.publish(eventChannel).catch((err) => {
        console.error('useMousetrapEmitter: callback: error: ', err);
      });
    };
    Mousetrap.bind(accelerator, callback, action);

    return () => {
      Mousetrap.unbind(accelerator, action);
    };
  }, [accelerator, eventChannel, action]);

  return null;
};

export default useMousetrapEmitter;
