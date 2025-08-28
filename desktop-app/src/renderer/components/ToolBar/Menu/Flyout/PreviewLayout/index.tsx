import { Icon } from '@iconify/react';
import { PREVIEW_LAYOUTS, PreviewLayout } from 'common/constants';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonGroup } from 'renderer/components/ButtonGroup';
import useKeyboardShortcut, {
  SHORTCUT_CHANNEL,
} from 'renderer/components/KeyboardShortcutsManager/useKeyboardShortcut';
import { selectLayout, setLayout } from 'renderer/store/features/renderer';

const PreviewLayoutSelector = () => {
  const layout = useSelector(selectLayout);
  const dispatch = useDispatch();

  const handleLayout = (newLayout: PreviewLayout) => {
    dispatch(setLayout(newLayout));
  };

  const toggleNextLayout = () => {
    const layouts = Object.values(PREVIEW_LAYOUTS);
    const currentIndex = layouts.findIndex((l) => l === layout);
    const nextIndex = (currentIndex + 1) % layouts.length;
    dispatch(setLayout(layouts[nextIndex]));
  };

  useKeyboardShortcut(SHORTCUT_CHANNEL.PREVIEW_LAYOUT, toggleNextLayout);

  return (
    <div className="flex flex-row items-center justify-start px-4">
      <span className="w-1/2">Preview Layout</span>
      <div className="flex w-fit items-center gap-3 px-5 ">
        <ButtonGroup
          buttons={[
            {
              content: (
                <div className="flex flex-col items-center text-xs">
                  {' '}
                  <Icon icon="radix-icons:layout" /> Column
                </div>
              ),
              srContent: 'Horizontal Layout',
              onClick: () => handleLayout(PREVIEW_LAYOUTS.COLUMN),
              isActive: layout === PREVIEW_LAYOUTS.COLUMN,
            },
            {
              content: (
                <div className="flex min-w-12 flex-col items-center text-xs">
                  {' '}
                  <Icon icon="lucide:layout-dashboard" /> Flex
                </div>
              ),
              srContent: 'Flex Layout',
              onClick: () => handleLayout(PREVIEW_LAYOUTS.FLEX),
              isActive: layout === PREVIEW_LAYOUTS.FLEX,
            },
            {
              content: (
                <div className="flex flex-col items-center text-xs">
                  {' '}
                  <Icon icon="bx:bx-grid-alt" /> Masonry
                </div>
              ),
              srContent: 'Masonry Layout',
              onClick: () => handleLayout(PREVIEW_LAYOUTS.MASONRY),
              isActive: layout === PREVIEW_LAYOUTS.MASONRY,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default PreviewLayoutSelector;
