// @flow
import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import BookmarkEditDialog from './BookmarkEditDialog';
import styles from './style.module.css';
import Globe from '../icons/Globe';

export const BookmarksBar = ({
  bookmarks,
  onBookmarkClick,
  onBookmarkDelete,
  onBookmarkEdit,
}) => (
  <div className={styles.bookmarks}>
    {bookmarks.map((bookmark, k) => (
      <BookmarkItem
        bookmark={bookmark}
        onClick={onBookmarkClick}
        key={`bookmark${k}`}
        onDelete={onBookmarkDelete}
        onEdit={onBookmarkEdit}
      />
    ))}
  </div>
);

const useToggle = () => {
  const [value, setValue] = useState(false);
  return [
    value,
    () => {
      setValue(true);
    },
    () => {
      setValue(false);
    },
  ];
};

const BookmarkItem = ({bookmark, onClick, onDelete, onEdit}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [renameDialog, openRenameDialog, closeRenameDialog] = useToggle(null);

  const handleContextMenu = function handleContextMenu(event) {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = () => {
    onClick(bookmark);
  };

  const handleDelete = () => {
    setAnchorEl(null);
    onDelete(bookmark);
  };

  const handleRename = (title, url) => {
    onEdit(bookmark, {title, url});
    setAnchorEl(null);
  };

  const closeDialog = () => {
    closeRenameDialog();
    setAnchorEl(null);
  };

  return (
    <>
      <div
        className={styles.bookmarkItem}
        key={bookmark.url}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <Globe height={10} className={styles.icon} />
        <span>{bookmark.title}</span>
      </div>
      <Menu
        id="bookmark-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        getContentAnchorEl={null}
        onContextMenu={handleClose}
      >
        <MenuItem onClick={openRenameDialog}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
      <BookmarkEditDialog
        open={renameDialog}
        onSubmit={handleRename}
        onClose={closeDialog}
        bookmark={bookmark}
      />
    </>
  );
};
