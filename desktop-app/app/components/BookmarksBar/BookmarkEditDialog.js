import React, {useRef} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function BookmarkEditDialog({
  open,
  onClose,
  onSubmit,
  bookmark,
}) {
  const titleInput = useRef(null);
  const urlInput = useRef(null);

  const handleSubmit = function handleSubmit(e) {
    onSubmit(
      titleInput.current.querySelector('input').value,
      urlInput.current.querySelector('input').value
    );
    onClose();
  };

  const handleKeyPress = function handleKeyPress(e) {
    if (e.key === 'Enter') {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Bookmark title</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          ref={titleInput}
          margin="dense"
          id="title"
          label="Title"
          type="text"
          onKeyPress={handleKeyPress}
          defaultValue={bookmark.title}
          fullWidth
        />
        <TextField
          style={{marginTop: '16px'}}
          autoFocus
          ref={urlInput}
          margin="dense"
          id="url"
          label="URL"
          type="text"
          onKeyPress={handleKeyPress}
          defaultValue={bookmark.url}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
