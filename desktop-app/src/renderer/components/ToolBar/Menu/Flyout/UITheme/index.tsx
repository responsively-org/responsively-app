import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'renderer/components/Button';
import { selectTheme, setTheme } from 'renderer/store/features/ui';

const UITheme = () => {
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();

  return (
    <div className="flex flex-row items-center justify-start px-4">
      <span className="w-1/2">UI Theme</span>
      <div className="flex items-center gap-2 border-l px-4 dark:border-slate-400">
        <Button
          onClick={() => {
            dispatch(setTheme('light'));
          }}
          isActive={theme === 'light'}
          subtle
        >
          <Icon icon="carbon:sun" />
        </Button>
        <Button
          onClick={() => {
            dispatch(setTheme('dark'));
          }}
          isActive={theme === 'dark'}
          subtle
        >
          <Icon icon="carbon:moon" />
        </Button>
        <Button
          onClick={() => {
            dispatch(setTheme('violet'));
          }}
          isActive={theme === 'violet'}
          subtle
        >
          <Icon icon="carbon:lightning" />
        </Button>
      </div>
    </div>
  );
};

export default UITheme;
