import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {makeStyles} from '@material-ui/core/styles';
import BookmarkEditDialog from './BookmarkEditDialog';
import Globe from '../icons/Globe';

const BookmarksBar = ({
  bookmarks,
  onBookmarkClick,
  onBookmarkDelete,
  onBookmarkEdit,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.bookmarks}>
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
};

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
  const classes = useStyles();

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
        className={classes.bookmarkItem}
        key={bookmark.url}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <Globe height={10} className={classes.icon} />
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

const useStyles = makeStyles(theme => ({
  bookmarks: {
    padding: '0 10px',
    display: 'flex',
    marginTop: '4px',
  },
  bookmarkItem: {
    color: theme.palette.text.primary,
    fill: theme.palette.text.primary,
    cursor: 'default',
    padding: '2px 10px',
    borderRadius: '15px',
    fontSize: '13px',
    minWidth: '100px',
    maxWidth: '150px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.background.default,
      fill: theme.palette.background.default,
    },
  },
  icon: {
    marginRight: '5px',
  },
}));

export default BookmarksBar;
