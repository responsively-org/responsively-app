// @flow
import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import BookmarkEditDialog from './BookmarkEditDialog';
import styles from './style.module.css';
import Globe from '../icons/Globe';

export const BookmarksBar = function({
  bookmarks,
  onBookmarkClick,
  onBookmarkDelete,
  onBookmarkEdit,
}) {
  return (
    <div className={styles.bookmarks}>
      {bookmarks.map((bookmark, k) => (
        <BookmarkItem
          bookmark={bookmark}
          onClick={onBookmarkClick}
          key={'bookmark' + k}
          onDelete={onBookmarkDelete}
          onEdit={onBookmarkEdit}
        />
      ))}
    </div>
  );
};

const useToggle = function() {
  const [value, setValue] = useState(false);
  return [
    value,
    function() {
      setValue(true);
    },
    function() {
      setValue(false);
    },
  ];
};

function BookmarkItem({bookmark, onClick, onDelete, onEdit}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [renameDialog, openRenameDialog, closeRenameDialog] = useToggle(null);

  const handleContextMenu = function(event) {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = function() {
    setAnchorEl(null);
  };

  const handleClick = function() {
    onClick(bookmark);
  };

  const handleDelete = function() {
    setAnchorEl(null);
    onDelete(bookmark);
  };

  const handleRename = function(title, url) {
    onEdit(bookmark, {title, url});
    setAnchorEl(null);
  };

  const closeDialog = function() {
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
}
