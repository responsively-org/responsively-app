import { useDispatch } from 'react-redux';
import Button from 'renderer/components/Button';
import { IBookmarks } from 'renderer/store/features/bookmarks';
import { setAddress } from 'renderer/store/features/renderer';
import { useState } from 'react';
import BookmarkListButton from './BookmarkListButton';
import BookmarkFlyout from './BookmarkFlyout';

export interface Props {
  bookmarks: IBookmarks[];
  handleBookmarkFlyout: () => void;
}

const ViewAllBookmarks = ({ bookmarks, handleBookmarkFlyout }: Props) => {
  const [currentBookmark, setCurrentBookmark] = useState<IBookmarks>({
    id: '',
    name: '',
    address: '',
  });
  const [openFlyout, setOpenFlyout] = useState(false);
  const dispatch = useDispatch();

  const areBookmarksPresent = bookmarks.length > 0;

  const handleBookmarkClick = (address: string) => {
    dispatch(setAddress(address));
    handleBookmarkFlyout();
  };

  return (
    <div>
      <div className="absolute top-[179px] right-[322px] z-50 flex max-h-[50vh] min-h-min flex-col overflow-x-auto overflow-y-auto rounded border bg-white text-sm shadow-lg ring-1 ring-slate-500 !ring-opacity-40 focus:outline-none dark:bg-slate-900 dark:ring-white dark:!ring-opacity-40">
        {bookmarks.map((bookmark) => {
          return (
            <>
              <BookmarkListButton
                bookmark={bookmark}
                handleBookmarkClick={handleBookmarkClick}
                setCurrentBookmark={setCurrentBookmark}
                setOpenFlyout={setOpenFlyout}
              />
            </>
          );
        })}
        {!areBookmarksPresent && (
          <Button className="w-60 py-2" disabled disableHoverEffects>
            No bookmarks found{' '}
          </Button>
        )}
      </div>
      <div className="absolute right-[580px] top-[180px] border">
        {openFlyout && (
          <BookmarkFlyout
            bookmark={currentBookmark}
            setOpenFlyout={setOpenFlyout}
          />
        )}
      </div>
    </div>
  );
};

export default ViewAllBookmarks;
