import React from 'react';
import { Icon } from '@iconify/react';
import { PREVIEW_LAYOUTS } from 'common/constants';
import { useDispatch, useSelector } from 'react-redux';
import useKeyboardShortcut, {
  SHORTCUT_CHANNEL,
} from 'renderer/components/KeyboardShortcutsManager/useKeyboardShortcut';
import Toggle from 'renderer/components/Toggle';
import { selectLayout, setLayout } from 'renderer/store/features/renderer';

const MasonryLayout = () => {
  const layout = useSelector(selectLayout);
  const dispatch = useDispatch();

  const handleLayout = () => {
    if (layout === PREVIEW_LAYOUTS.MASONRY)
      dispatch(setLayout(PREVIEW_LAYOUTS.FLEX));
    else dispatch(setLayout(PREVIEW_LAYOUTS.MASONRY));
  };

  useKeyboardShortcut(SHORTCUT_CHANNEL.PREVIEW_LAYOUT, handleLayout);

  return (
    <div className="flex flex-row items-center justify-start px-4">
      <span className="w-1/2">Masonry Layout</span>
      <div className="flex w-fit items-center gap-3 border-l px-5 dark:border-slate-400">
        <Icon icon="mdi:view-grid-outline" />
        <Toggle
          isOn={layout === PREVIEW_LAYOUTS.MASONRY}
          onChange={(e) => {
            if (e.target.checked) {
              dispatch(setLayout(PREVIEW_LAYOUTS.MASONRY));
            } else {
              dispatch(setLayout(PREVIEW_LAYOUTS.COLUMN));
            }
          }}
        />
        <Icon icon="mdi:view-masonry-outline" />
      </div>
    </div>
  );
};

export default MasonryLayout;
