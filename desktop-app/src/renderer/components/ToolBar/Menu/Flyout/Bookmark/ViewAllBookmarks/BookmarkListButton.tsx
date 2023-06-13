import cx from 'classnames';
import Button from 'renderer/components/Button';
import { IBookmarks } from 'renderer/store/features/bookmarks';
import { Icon } from '@iconify/react';
import { useState } from 'react';

export interface Props {
  bookmark: IBookmarks;
  handleBookmarkClick: (address: string) => void;
  setCurrentBookmark: (bookmark: IBookmarks) => void;
  setOpenFlyout: (bool: boolean) => void;
}

const BookmarkListButton = ({
  bookmark,
  handleBookmarkClick,
  setCurrentBookmark,
  setOpenFlyout,
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex h-[40px] w-60 justify-between hover:bg-slate-400 dark:hover:bg-slate-600 "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      key={bookmark.id}
    >
      <button
        type="button"
        className="cursor-default truncate pl-3"
        onClick={() => handleBookmarkClick(bookmark.address)}
      >
        {bookmark.name}
      </button>
      <button
        type="button"
        className={cx('ml-1 flex shrink-0 items-center justify-center px-2', {
          invisible: !isHovered,
          visible: isHovered,
        })}
        onClick={() => {
          setCurrentBookmark(bookmark);
          setOpenFlyout(true);
        }}
      >
        <Icon icon="ic:sharp-edit" />
      </button>
    </div>
  );
};

export default BookmarkListButton;
