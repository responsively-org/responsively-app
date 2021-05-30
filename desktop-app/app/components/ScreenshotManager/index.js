import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Typography,
} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(theme => ({
  paper: {
    color: '#fff!important',
    backgroundColor: '#424242!important',
  },
  formItems: {
    padding: '0 2ch',
    '& > *': {
      margin: theme.spacing(1),
      width: '25ch',
      boxSizing: 'border-box',
    },
  },
}));

export default function ScreenshotManager({
  browser,
  isOpen,
  handleOk,
  handleClose,
}) {
  const [mergeImages, setMergeImages] = useState(false);
  const [deviceChecks, setDeviceChecks] = useState(() =>
    browser.devices.map(device => ({
      id: device.id,
      name: device.name,
      selected: false,
    }))
  );
  const [delay, setDelay] = useState(100);
  const styles = useStyles();

  const handleChange = (id: string) => {
    const newState = deviceChecks.map(device => {
      if (id !== device.id) return {...device};
      return {
        ...device,
        selected: !device.selected,
      };
    });
    setDeviceChecks(newState);
  };

  const handleGo = () => {
    const payload = {
      isMergeImages: mergeImages,
      deviceChecks,
      delay,
    };
    handleOk(payload);
  };

  const handleDelay = event => {
    setDelay(event.target.delay);
  };

  return (
    <Dialog
      fullWidth={true}
      open={isOpen}
      onClose={handleClose}
      classes={{paper: styles.paper}}
    >
      <DialogTitle>Choose Screenshot Options</DialogTitle>
      <DialogContent>
        <form className={styles.formItems}>
          <FormControlLabel
            control={
              <Checkbox
                checked={mergeImages}
                onChange={() => setMergeImages(!mergeImages)}
              />
            }
            label="Merge Images"
          />
          <TextField
            label="Delay between scroll operation"
            value={delay}
            onChange={handleDelay}
          />
        </form>
        <Divider />
        <form className={styles.formItems}>
          {deviceChecks.map(device => (
            <FormControlLabel
              key={device.id}
              control={
                <Checkbox
                  checked={device.selected}
                  onChange={() => handleChange(device.id)}
                  name={device.name}
                />
              }
              label={device.name}
            />
          ))}
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleGo}>
          Go
        </Button>
      </DialogActions>
    </Dialog>
  );
}
