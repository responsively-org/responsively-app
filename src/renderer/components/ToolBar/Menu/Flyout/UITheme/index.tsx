import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'renderer/components/Button';
import useKeyboardShortcut, {
  SHORTCUT_CHANNEL,
} from 'renderer/components/KeyboardShortcutsManager/useKeyboardShortcut';
import { selectDarkMode, setDarkMode } from 'renderer/store/features/ui';

const UITheme = () => {
  const darkMode = useSelector(selectDarkMode);
  const dispatch = useDispatch();

  const handleTheme = () => dispatch(setDarkMode(!darkMode));

  useKeyboardShortcut(SHORTCUT_CHANNEL.THEME, handleTheme);

  return (
    <div className="flex flex-row items-center justify-start px-4">
      <span className="w-1/2">UI Theme</span>
      <div className="flex items-center gap-2 border-l px-4 dark:border-slate-400">
        <Button onClick={handleTheme} subtle>
          <Icon icon={darkMode ? 'carbon:moon' : 'carbon:sun'} />
        </Button>
      </div>
    </div>
  );
};

export default UITheme;
