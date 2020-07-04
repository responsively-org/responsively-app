import React, {useRef, useState, useEffect} from 'react';
import {ipcRenderer} from 'electron';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function HttpAuthDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    const handler = (event, args) => {
      setUrl(args.url);
      setOpen(true);
    };
    ipcRenderer.on('http-auth-prompt', handler);
    return () => {
      ipcRenderer.removeListener('http-auth-prompt', handler);
    };
  }, []);

  function handleClose(status) {
    if (!status) {
      ipcRenderer.send('http-auth-promt-response', {url});
    }
    ipcRenderer.send('http-auth-promt-response', {
      url,
      username: usernameRef.current.querySelector('input').value,
      password: passwordRef.current.querySelector('input').value,
    });
    setOpen(false);
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        disableBackdropClick
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Sign-in</DialogTitle>
        <form
          id="my-form-id"
          onSubmit={e => {
            e.preventDefault();
            handleClose(true);
          }}
        >
          <DialogContent>
            <DialogContentText>
              {url ? <strong>{url}</strong> : 'The webpage'} requires HTTP Basic
              authentication to connect, please enter the details to continue.
            </DialogContentText>

            <TextField
              ref={usernameRef}
              autoFocus
              margin="dense"
              id="username"
              label="Username"
              type="text"
              fullWidth
            />
            <TextField
              ref={passwordRef}
              margin="dense"
              id="password"
              label="Password"
              type="password"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleClose(false)} color="secondary">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => handleClose(true)}
              color="primary"
              type="submit"
              primary
            >
              Sign In
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
