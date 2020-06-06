import React, { useRef } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function BookmarkRenameDialog({open, onClose, onSubmit, defaultValue}) {
  const input = useRef(null)

  const handleSubmit = function (e) {
    onSubmit(input.current.querySelector('input').value)
    onClose()
  }

  const handleKeyPress = function (e) {
    if (e.key === 'Enter') {
      handleSubmit(e)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
      <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Bookmark title</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            ref={input}
            margin="dense"
            id="name"
            label="Title"
            type="text"
            onKeyPress={handleKeyPress}
            defaultValue={defaultValue}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
  );
}