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
      <div className="absolute right-[316px] top-0 z-50 flex max-h-[60vh] min-h-min flex-col overflow-x-auto overflow-y-auto rounded border bg-slate-100 focus:outline-none dark:bg-slate-900 dark:ring-white dark:!ring-opacity-40">
        {bookmarks.map((bookmark) => {
          return (
            <div key={bookmark.id}>
              <BookmarkListButton
                bookmark={bookmark}
                handleBookmarkClick={handleBookmarkClick}
                setCurrentBookmark={setCurrentBookmark}
                setOpenFlyout={setOpenFlyout}
              />
            </div>
          );
        })}
        {!areBookmarksPresent && (
          <Button className="w-60 py-2" disabled disableHoverEffects>
            No bookmarks found{' '}
          </Button>
        )}
      </div>
      <div className="absolute right-[560px]">
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
