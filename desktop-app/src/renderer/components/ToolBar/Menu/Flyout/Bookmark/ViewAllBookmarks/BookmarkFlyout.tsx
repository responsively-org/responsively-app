import {useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';
import Button from 'renderer/components/Button';
import {IBookmarks, addBookmark, removeBookmark} from 'renderer/store/features/bookmarks';
import Input from 'renderer/components/Input';

interface Props {
  bookmark: IBookmarks;
  onChange: (bookmark: IBookmarks) => void;
  onClose: () => void;
}

const BookmarkFlyout = ({bookmark, onChange, onClose}: Props) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(addBookmark(bookmark));
    onClose();
  };

  const handleRemove = () => {
    dispatch(removeBookmark(bookmark));
    onClose();
  };

  useEffect(() => {
    nameInputRef.current?.focus();
    nameInputRef.current?.select();
  }, []);

  return (
    <div role="dialog" aria-label="Edit bookmark">
      <form
        onSubmit={handleSave}
        className="z-50 flex w-80 flex-col gap-4 rounded bg-white px-6 py-4 text-sm shadow-lg ring-1 ring-slate-500/40 focus:outline-none dark:bg-slate-900 dark:ring-white/40"
      >
        <Input
          ref={nameInputRef}
          type="text"
          className="rounded-xs bg-slate-200 p-1 px-1 dark:bg-slate-700"
          name="name"
          label="Bookmark Name"
          value={bookmark.name}
          onChange={(event) => onChange({...bookmark, name: event.target.value})}
        />
        <Input
          type="text"
          className="rounded-xs bg-slate-200 p-1 px-1 dark:bg-slate-700"
          name="address"
          label="Address"
          value={bookmark.address}
          onChange={(event) => onChange({...bookmark, address: event.target.value})}
        />
        <div className="mt-4 mb-1 flex justify-center">
          <Button onClick={handleRemove} id="remove" className="mr-6 px-6">
            Remove
          </Button>
          <Button type="submit" id="add" className="px-8" isActionButton>
            Done
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookmarkFlyout;
