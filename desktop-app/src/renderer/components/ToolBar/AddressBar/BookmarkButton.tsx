import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import Button from 'renderer/components/Button';
import { IBookmarks, selectBookmarks } from 'renderer/store/features/bookmarks';
import BookmarkFlyout from '../Menu/Flyout/Bookmark/ViewAllBookmarks/BookmarkFlyout';

interface Props {
  currentAddress: string;
  pageTitle: string;
}

const BookmarkButton = ({ currentAddress, pageTitle }: Props) => {
  const [openFlyout, setOpenFlyout] = useState<boolean>(false);
  const [bookmark, setBookmark] = useState<IBookmarks>({
    id: '',
    name: pageTitle,
    address: currentAddress,
  });

  const bookmarks = useSelector(selectBookmarks);

  const handleFlyout = () => setOpenFlyout(!openFlyout);

  useEffect(() => {
    const bookmarkFound = bookmarks.find(
      (bm: IBookmarks) => bm.address === currentAddress
    );
    setBookmark(
      bookmarkFound || {
        id: '',
        name: pageTitle,
        address: currentAddress,
      }
    );
  }, [bookmarks, currentAddress, pageTitle]);

  const isPageBookmarked = Boolean(bookmark.name);

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
          <BookmarkFlyout bookmark={bookmark} setOpenFlyout={setOpenFlyout} />
        )}
      </div>
    </>
  );
};

export default BookmarkButton;
