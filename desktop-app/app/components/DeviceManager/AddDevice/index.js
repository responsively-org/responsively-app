import React, {Fragment, useState} from 'react';
import cx from 'classnames';
import Dialog from '@material-ui/core/Dialog';
import DialogContentText from '@material-ui/core/DialogContentText';
import {makeStyles} from '@material-ui/core/styles';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import InputAdornment from '@material-ui/core/InputAdornment';
import Input from '@material-ui/core/Input';
import FormLabel from '@material-ui/core/FormLabel';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import {Typography, Grid} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  fab: {
    position: 'absolute',
    top: theme.spacing(10),
    right: theme.spacing(3),
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  inputField: {
    marginRight: '1%',
    width: '49%',
  },
}));

export default function AddDevice(props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [userAgentString, setUserAgentString] = useState('');
  const [previewState, setPreviewState] = useState(true);
  const classes = useStyles();

  const closeDialog = () => setOpen(false);

  const saveDevice = () => {
    props.addNewDevice({
      name,
      width: parseInt(width, 10),
      height: parseInt(height, 10),
      added: previewState,
      useragent: userAgentString,
      id: `custom-${new Date().getTime()}`,
    });
    console.log('saving device');
    closeDialog();
  };
  return (
    <Fragment>
      <Fab
        variant="extended"
        aria-label="add"
        color="primary"
        className={classes.fab}
        onClick={() => setOpen(true)}
      >
        <AddIcon className={classes.extendedIcon} /> New Device
      </Fab>

      <Dialog
        open={open}
        onClose={closeDialog}
        aria-labelledby="form-dialog-title"
        fullWidth={true}
      >
        <DialogTitle id="form-dialog-title">New Device</DialogTitle>
        <DialogContent>
          <DialogContentText color="ternary">
            Please enter the details of the new device
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            margin="normal"
            label="Name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <TextField
            className={classes.inputField}
            variant="outlined"
            margin="normal"
            label="Width"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
            value={width}
            onChange={e => setWidth(e.target.value)}
          />
          <TextField
            className={classes.inputField}
            variant="outlined"
            margin="normal"
            label="Height"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
            value={height}
            onChange={e => setHeight(e.target.value)}
          />
          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            label="User-Agent String"
            type="text"
            value={userAgentString}
            onChange={e => setUserAgentString(e.target.value)}
          />
          <Typography component="div">
            <Grid component="label" container alignItems="center" spacing={1}>
              <Grid item style={{flex: 1}} className="MuiFormLabel-root">
                Activate
              </Grid>
              <Grid
                item
                className={cx('MuiFormLabel-root', {
                  'Mui-focused': !previewState,
                })}
              >
                Off
              </Grid>
              <Grid item>
                <Switch
                  color="primary"
                  checked={previewState}
                  onChange={(event, checked) => setPreviewState(checked)}
                />
              </Grid>
              <Grid
                item
                className={cx('MuiFormLabel-root', {
                  'Mui-focused': previewState,
                })}
              >
                On
              </Grid>
            </Grid>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button variant="contained" onClick={saveDevice} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
