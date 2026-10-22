import {Icon} from '@iconify/react';
import {useEffect, useState} from 'react';
import {closeMenuFlyout, selectMenuFlyout} from 'renderer/store/features/ui';
import {useDispatch, useSelector} from 'react-redux';
import {selectBookmarks} from 'renderer/store/features/bookmarks';
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
      <button
        type="button"
        className="flex w-full items-center gap-[10px] rounded-[7px] px-[10px] py-2 text-[13.5px] text-fg hover:bg-hover focus:outline-none focus-visible:bg-hover"
      >
        <span className="pointer-events-none contents">
          <Icon icon="ic:baseline-star-border" fontSize={15} className="text-muted" />
          Bookmarks
          <Icon
            icon="ic:baseline-arrow-drop-down"
            fontSize={18}
            className="ml-auto -rotate-90 transform text-muted"
          />
        </span>
      </button>
      {isOpen && (
        <ViewAllBookmarks bookmarks={bookmarks} handleBookmarkFlyout={handleBookmarkFlyout} />
      )}
    </div>
  );
};

export default Bookmark;
