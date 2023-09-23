import { Icon } from '@iconify/react';
import { useState, useMemo } from 'react';
import { useDetectClickOutside } from 'react-detect-click-outside';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import Button from 'renderer/components/Button';

import {
  IBookmarks,
  addBookmark,
  selectBookmarks,
} from 'renderer/store/features/bookmarks';
import useKeyboardShortcut, {
  SHORTCUT_CHANNEL,
} from 'renderer/components/KeyboardShortcutsManager/useKeyboardShortcut';
import BookmarkFlyout from '../Menu/Flyout/Bookmark/ViewAllBookmarks/BookmarkFlyout';

interface Props {
  currentAddress: string;
  pageTitle: string;
}

const BookmarkButton = ({ currentAddress, pageTitle }: Props) => {
  const [openFlyout, setOpenFlyout] = useState<boolean>(false);
  const dispatch = useDispatch();
  const ref = useDetectClickOutside({
    onTriggered: () => {
      if (!openFlyout) return;
      if (openFlyout) setOpenFlyout(false);
    },
  });

  const initbookmark = {
    id: '',
    name: pageTitle,
    address: currentAddress,
  };

  const bookmarks = useSelector(selectBookmarks);
  const bookmarkFound = useMemo(
    () => bookmarks.find((bm: IBookmarks) => bm.address === currentAddress),
    [currentAddress, bookmarks]
  );

  const isPageBookmarked = !!bookmarkFound;

  const handleFlyout = () => {
    setOpenFlyout(!openFlyout);
  };

  const handleKeyboardShortcut = () => {
    handleFlyout();
    dispatch(addBookmark(bookmarkFound || initbookmark));
  };

  useKeyboardShortcut(SHORTCUT_CHANNEL.BOOKMARK, handleKeyboardShortcut);

  return (
    <div ref={ref}>
      <div>
        <Button
          className={cx('rounded-full', {
            'text-blue-500': isPageBookmarked,
          })}
          onClick={handleFlyout}
          title={`${!isPageBookmarked ? 'Add' : 'Remove'} bookmark`}
        >
          <Icon
            icon={`ic:baseline-star${!isPageBookmarked ? '-border' : ''}`}
          />
        </Button>
      </div>

      <div className="absolute top-[40px] right-[0px]">
        {openFlyout && (
          <BookmarkFlyout
            bookmark={bookmarkFound || initbookmark}
            setOpenFlyout={setOpenFlyout}
          />
        )}
      </div>
    </div>
  );
};

export default BookmarkButton;
