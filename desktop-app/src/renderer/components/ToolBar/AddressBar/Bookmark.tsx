import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import Button from 'renderer/components/Button';
import {
  IBookmarks,
  addBookmark,
  removeBookmark,
  selectBookmarks,
} from 'renderer/store/features/bookmarks';
import Input from '../../Input';

interface Props {
  currentAddress: string;
}

const Bookmark = ({ currentAddress }: Props) => {
  const [currentBookmark, setCurrentBookmark] = useState<IBookmarks>({
    name: '',
    address: currentAddress,
  });
  const [openFlyout, setOpenFlyout] = useState<boolean>(false);
  const dispatch = useDispatch();
  const bookmarks = useSelector(selectBookmarks);
  const isPageBookmarked = Boolean(
    currentBookmark.address && currentBookmark.name
  );

  const handleFlyout = () => setOpenFlyout(!openFlyout);

  const handleButton = (e: React.MouseEvent) => {
    const target = e.target as HTMLButtonElement;
    const buttonType = target.id;

    if (buttonType === 'add') dispatch(addBookmark(currentBookmark));
    else dispatch(removeBookmark(currentBookmark));

    setOpenFlyout(false);
  };

  const handleChange = (e: React.ChangeEvent) => {
    const target = e.target as HTMLButtonElement;
    const inputType = target.id;
    const inputValue = target.value;

    setCurrentBookmark((prevBookmark) => ({
      ...prevBookmark,
      [inputType]: inputValue,
    }));
  };

  useEffect(() => {
    const bookmarkFound = bookmarks.find(
      (bookmark: IBookmarks) => bookmark.address === currentAddress
    );
    setCurrentBookmark({
      name: bookmarkFound?.name || '',
      address: bookmarkFound?.address || currentAddress,
    });
  }, [bookmarks, currentAddress]);

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

      {openFlyout && (
        <div className="absolute top-[40px] right-[0px] z-50 flex w-80 flex-col gap-4 rounded bg-white p-2 px-6 py-4 text-sm shadow-lg ring-1 ring-slate-500 !ring-opacity-40 focus:outline-none dark:bg-slate-900 dark:ring-white dark:!ring-opacity-40">
          <Input
            type="text"
            className="rounded-sm bg-slate-200 p-1 px-1 dark:bg-slate-700"
            id="name"
            name="name"
            label="Bookmark Name"
            value={currentBookmark.name}
            onChange={handleChange}
          />
          <Input
            type="text"
            className="rounded-sm bg-slate-200 p-1 px-1 dark:bg-slate-700"
            id="address"
            name="address"
            label="Address"
            value={currentBookmark.address}
            onChange={handleChange}
          />
          <div className="mt-4 mb-1 flex justify-center">
            <Button onClick={handleButton} id="remove" className="mr-6 px-6">
              Remove
            </Button>
            <Button
              onClick={handleButton}
              id="add"
              className="px-8"
              isActionButton
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Bookmark;
