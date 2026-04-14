import {useSelector} from 'react-redux';
import {selectResolvedShortcutBindings} from 'renderer/store/features/shortcuts';
import {ShortcutChannel} from './constants';
import useMousetrapEmitter from './useMousetrapEmitter';

interface ShortcutBindingProps {
  channel: ShortcutChannel;
  keys: string[];
}

const ShortcutBinding = ({channel, keys}: ShortcutBindingProps) => {
  useMousetrapEmitter(keys, channel);
  return null;
};

const KeyboardShortcutsManager = () => {
  const shortcutBindings = useSelector(selectResolvedShortcutBindings);

  return (
    <>
      {Object.entries(shortcutBindings).map(([channel, keys]) => (
        <ShortcutBinding key={channel} channel={channel as ShortcutChannel} keys={keys} />
      ))}
    </>
  );
};

export default KeyboardShortcutsManager;
