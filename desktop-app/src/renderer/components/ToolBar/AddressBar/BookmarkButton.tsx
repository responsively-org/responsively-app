import { Icon } from '@iconify/react';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import Button from 'renderer/components/Button';
import {
  IBookmarks,
  removeBookmark,
  selectBookmarks,
} from 'renderer/store/features/bookmarks';
import BookmarkFlyout from '../Menu/Flyout/Bookmark/ViewAllBookmarks/BookmarkFlyout';

interface Props {
  currentAddress: string;
  pageTitle: string;
}

const BookmarkButton = ({ currentAddress, pageTitle }: Props) => {
  const [openFlyout, setOpenFlyout] = useState<boolean>(false);
  const initbookmark = {
    id: '',
    name: pageTitle,
    address: currentAddress,
  };

  const dispatch = useDispatch();

  const bookmarks = useSelector(selectBookmarks);
  const bookmarkFound = useMemo(
    () => bookmarks.find((bm: IBookmarks) => bm.address === currentAddress),
    [currentAddress, bookmarks]
  );

  const isPageBookmarked = !!bookmarkFound;

  const handleFlyout = () => {
    if (isPageBookmarked) {
      // remove
      dispatch(removeBookmark(bookmarkFound));
      return;
    }
    // open flyout
    setOpenFlyout(!openFlyout);
  };

  return (
    <>
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
            bookmark={initbookmark}
            setOpenFlyout={setOpenFlyout}
          />
        )}
      </div>
    </>
  );
};

export default BookmarkButton;
