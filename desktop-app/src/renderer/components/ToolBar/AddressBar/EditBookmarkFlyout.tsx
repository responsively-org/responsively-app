import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from 'renderer/components/Button';
import {
  IBookmarks,
  addBookmark,
  removeBookmark,
} from 'renderer/store/features/bookmarks';

export interface Props {
  currentBookmark: IBookmarks;
  setOpenEditBookmarkFlyout: (bool: boolean) => void;
  address: string;
}

const EditBookmarkFlyout = ({
  currentBookmark,
  setOpenEditBookmarkFlyout,
  address,
}: Props) => {
  const [name, setName] = useState<string>(currentBookmark.name);
  const dispatch = useDispatch();

  const handleSave = () => {
    dispatch(addBookmark({ name, address }));
    setOpenEditBookmarkFlyout(false);
  };

  const handleRemove = () => {
    dispatch(removeBookmark({ name, address }));
    setOpenEditBookmarkFlyout(false);
  };

  return (
    <div className="absolute top-[40px] right-[0px] z-50 flex w-80 flex-col gap-2 rounded bg-white p-2 px-6 py-4 text-sm shadow-lg ring-1 ring-slate-500 !ring-opacity-40 focus:outline-none dark:bg-slate-900 dark:ring-white dark:!ring-opacity-40">
      <div className="flex flex-col gap-2">
        <span className="w-50 mr-6 overflow-hidden text-ellipsis whitespace-nowrap">
          Bookmark Name
        </span>
        <input
          type="text"
          className="rounded-sm bg-slate-200 p-1 px-1 dark:bg-slate-700"
          id="bookmark-name"
          name="bookmarkName"
          placeholder=""
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mt-4 flex justify-center">
        <Button onClick={handleRemove} className="mr-6 px-6">
          Remove
        </Button>
        <Button onClick={handleSave} className="px-8" isActionButton>
          Save
        </Button>
      </div>
    </div>
  );
};

export default EditBookmarkFlyout;
