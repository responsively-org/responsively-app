import React from 'react';
import Button from '@material-ui/core/Button';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const DeleteWorkspaceDialog = ({open, onCancel, onOk}) => (
  <Dialog
    open={open}
    onClose={onCancel}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">Are you sure?</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        You about to delete an active Workspace. Workspace will be deleted
        permanently. If you want to proceed please click &quot;Ok&quot;
        otherwise &quot;Cancel&quot;.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} color="primary" autoFocus>
        Cancel
      </Button>
      <Button onClick={onOk} color="primary">
        Ok
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteWorkspaceDialog;
