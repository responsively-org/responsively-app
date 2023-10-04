import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from 'renderer/components/Button';
import {
  IBookmarks,
  addBookmark,
  removeBookmark,
} from 'renderer/store/features/bookmarks';
import Input from 'renderer/components/Input';

interface Props {
  bookmark: IBookmarks;
  setOpenFlyout: (bool: boolean) => void;
}

const BookmarkFlyout = ({ bookmark, setOpenFlyout }: Props) => {
  const [currentBookmark, setCurrentBookmark] = useState<IBookmarks>(bookmark);
  const dispatch = useDispatch();

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
    setCurrentBookmark(bookmark);
  }, [bookmark]);

  return (
    <>
      <div className="z-50 flex w-80 flex-col gap-4 rounded bg-white px-6 py-4 text-sm shadow-lg ring-1 ring-slate-500 !ring-opacity-40 focus:outline-none dark:bg-slate-900 dark:ring-white dark:!ring-opacity-40">
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
    </>
  );
};

export default BookmarkFlyout;
