import { useDispatch } from 'react-redux';
import Button from 'renderer/components/Button';
import { IBookmarks } from 'renderer/store/features/bookmarks';
import { setAddress } from 'renderer/store/features/renderer';

export interface Props {
  bookmarks: IBookmarks[];
  handleBookmarkFlyout: () => void;
}

const ViewAllBookmarks = ({ bookmarks, handleBookmarkFlyout }: Props) => {
  const dispatch = useDispatch();

  const areBookmarksPresent = bookmarks.length > 0;

  const handleBookmarkClick = (address: string) => {
    dispatch(setAddress(address));
    handleBookmarkFlyout();
  };

  return (
    <div className="absolute top-[179px] right-[322px] z-50 flex flex-col rounded bg-white text-sm shadow-lg ring-1 ring-slate-500 !ring-opacity-40 focus:outline-none dark:bg-slate-900 dark:ring-white dark:!ring-opacity-40">
      {bookmarks.map((bookmark) => {
        return (
          <div className="w-60 overflow-hidden">
            <Button
              className="w-full cursor-pointer justify-between truncate py-2 px-4"
              onClick={() => handleBookmarkClick(bookmark.address)}
            >
              {bookmark.name}
            </Button>
          </div>
        );
      })}
      {!areBookmarksPresent && (
        <Button className="w-60 py-2" disabled disableHoverEffects>
          No bookmarks found{' '}
        </Button>
      )}
    </div>
  );
};

export default ViewAllBookmarks;
