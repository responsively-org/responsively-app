import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import Button from 'renderer/components/Button';
import { closeMenuFlyout, selectMenuFlyout } from 'renderer/store/features/ui';
import { useDispatch, useSelector } from 'react-redux';
import { selectBookmarks } from 'renderer/store/features/bookmarks';
import ViewAllBookmarks from './ViewAllBookmarks';

const Bookmark = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dispatch = useDispatch();
  const menuFlyout = useSelector(selectMenuFlyout);
  const bookmarks = useSelector(selectBookmarks);

  const handleBookmarkFlyout = () => {
    setIsOpen(!isOpen);
    dispatch(closeMenuFlyout(!isOpen));
  };

  useEffect(() => {
    if (!menuFlyout) setIsOpen(false);
  }, [menuFlyout]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div>
        <div className="relative right-2 w-80 dark:border-slate-400">
          <Button
            className="flex w-full items-center justify-between pl-6"
            isActive={isOpen}
          >
            <span>Bookmarks</span>
            <Icon
              className="mr-3 -rotate-90 transform"
              icon="ic:baseline-arrow-drop-down"
              height={20}
            />
          </Button>
        </div>
      </div>
      {isOpen && (
        <ViewAllBookmarks
          bookmarks={bookmarks}
          handleBookmarkFlyout={handleBookmarkFlyout}
        />
      )}
    </div>
  );
};

export default Bookmark;
