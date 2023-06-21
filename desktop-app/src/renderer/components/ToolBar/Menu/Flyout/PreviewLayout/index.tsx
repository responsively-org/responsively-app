import { Icon } from '@iconify/react';
import { PREVIEW_LAYOUTS } from 'common/constants';
import { useDispatch, useSelector } from 'react-redux';
import { SHORTCUT_CHANNEL } from 'renderer/components/KeyboardShortcutsManager/constants';
import useKeyboardShortcut from 'renderer/components/KeyboardShortcutsManager/useKeyboardShortcut';
import Toggle from 'renderer/components/Toggle';
import { selectLayout, setLayout } from 'renderer/store/features/renderer';

const PreviewLayout = () => {
  const layout = useSelector(selectLayout);
  const dispatch = useDispatch();

  const handleLayout = () => {
    if (layout === PREVIEW_LAYOUTS.FLEX)
      dispatch(setLayout(PREVIEW_LAYOUTS.COLUMN));
    else dispatch(setLayout(PREVIEW_LAYOUTS.FLEX));
  };

  useKeyboardShortcut(SHORTCUT_CHANNEL.PREVIEW_LAYOUT, handleLayout);

  return (
    <div className="flex flex-row items-center justify-start px-4">
      <span className="w-1/2">Preview Layout</span>
      <div className="flex w-fit items-center gap-3 border-l px-5 dark:border-slate-400">
        <Icon icon="radix-icons:layout" />
        <Toggle
          isOn={layout === PREVIEW_LAYOUTS.FLEX}
          onChange={(e) => {
            if (e.target.checked) {
              dispatch(setLayout(PREVIEW_LAYOUTS.FLEX));
            } else {
              dispatch(setLayout(PREVIEW_LAYOUTS.COLUMN));
            }
          }}
        />
        <Icon icon="lucide:layout-dashboard" />
      </div>
    </div>
  );
};

export default PreviewLayout;
