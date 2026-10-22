import {Icon} from '@iconify/react';
import {useCallback, useEffect, useRef, useState} from 'react';
import useClickOutside from 'renderer/hooks/useClickOutside';
import {useDispatch, useSelector} from 'react-redux';
import cx from 'classnames';
import Button from 'renderer/components/Button';

import {IBookmarks, addBookmark, selectBookmarks} from 'renderer/store/features/bookmarks';
import useKeyboardShortcut, {
  SHORTCUT_CHANNEL,
} from 'renderer/components/KeyboardShortcutsManager/useKeyboardShortcut';
import BookmarkFlyout from '../Menu/Flyout/Bookmark/ViewAllBookmarks/BookmarkFlyout';

interface Props {
  currentAddress: string;
  pageTitle: string;
}

const BookmarkButton = ({currentAddress, pageTitle}: Props) => {
  const [editingBookmark, setEditingBookmark] = useState<IBookmarks | null>(null);
  const editingPageAddress = useRef(currentAddress);
  const dispatch = useDispatch();
  const bookmarks = useSelector(selectBookmarks);
  const bookmarkFound = bookmarks.find((bookmark) => bookmark.address === currentAddress);
  const isPageBookmarked = !!bookmarkFound;

  const dismissFlyout = useCallback(() => {
    if (!editingBookmark) return;
    // Like Chrome's bookmark bubble, dismissing the editor keeps the bookmark
    // and applies its edits. Only the explicit Remove action deletes it.
    dispatch(addBookmark(editingBookmark));
    setEditingBookmark(null);
  }, [dispatch, editingBookmark]);
  const ref = useClickOutside(dismissFlyout);

  useEffect(() => {
    if (currentAddress !== editingPageAddress.current) dismissFlyout();
  }, [currentAddress, dismissFlyout]);

  useEffect(() => {
    // Guest webviews receive pointer events in their own document. The host
    // window loses focus when the user enters a preview, so close there too.
    window.addEventListener('blur', dismissFlyout);
    return () => window.removeEventListener('blur', dismissFlyout);
  }, [dismissFlyout]);

  const openFlyout = () => {
    if (!currentAddress.trim() || editingBookmark) return;

    // Use the prepared action's id for the editor so Done updates the bookmark
    // created here, instead of adding a second copy.
    const action = addBookmark(
      bookmarkFound || {name: pageTitle || currentAddress, address: currentAddress}
    );
    if (!bookmarkFound) dispatch(action);
    editingPageAddress.current = currentAddress;
    setEditingBookmark(action.payload);
  };

  useKeyboardShortcut(SHORTCUT_CHANNEL.BOOKMARK, openFlyout);

  return (
    <div ref={ref}>
      <div>
        <Button
          className={cx('rounded-full', {
            'text-blue-500': isPageBookmarked,
          })}
          onClick={editingBookmark ? dismissFlyout : openFlyout}
          disabled={!currentAddress.trim()}
          title={`${isPageBookmarked ? 'Edit' : 'Add'} bookmark`}
          aria-label={`${isPageBookmarked ? 'Edit' : 'Add'} bookmark`}
          aria-haspopup="dialog"
          aria-expanded={editingBookmark !== null}
        >
          <Icon icon={`ic:baseline-star${!isPageBookmarked ? '-border' : ''}`} />
        </Button>
      </div>

      <div className="absolute top-[40px] right-0">
        {editingBookmark && (
          <BookmarkFlyout
            bookmark={editingBookmark}
            onChange={setEditingBookmark}
            onClose={() => setEditingBookmark(null)}
          />
        )}
      </div>
    </div>
  );
};

export default BookmarkButton;
