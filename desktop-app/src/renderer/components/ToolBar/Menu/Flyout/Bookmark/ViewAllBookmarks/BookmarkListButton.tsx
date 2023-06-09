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
      className="flex w-60"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      key={bookmark.id}
    >
      <Button
        className="w-50 align-center flex h-[40px] h-full w-full cursor-pointer justify-between truncate p-0 pl-3 pr-1 text-left"
        style={{ display: 'block' }}
        onClick={() => handleBookmarkClick(bookmark.address)}
      >
        {bookmark.name}
      </Button>
      <Button
        className={cx('flex cursor-pointer items-center px-2', {
          invisible: !isHovered,
          visible: isHovered,
        })}
        style={{ display: 'block' }}
        onClick={() => {
          setCurrentBookmark(bookmark);
          setOpenFlyout(true);
        }}
      >
        <Icon icon="ic:sharp-edit" />
      </Button>
    </div>
  );
};

export default BookmarkListButton;
