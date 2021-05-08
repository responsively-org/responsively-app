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

const useStyles = makeStyles(theme => ({
  paper: {
    backgroundColor: 'inherit', // include theme colors here
    color: 'inherit',
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
  const [zip, setZip] = useState(false);
  const [deviceChecks, setDeviceChecks] = useState(() =>
    browser.devices.map(device => ({
      id: device.id,
      name: device.name,
      selected: false,
    }))
  );
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
      zip,
      isMergeImages: mergeImages,
      deviceChecks,
    };
    handleOk(payload);
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
        <Typography
          color="error"
          variant="overline"
          display="block"
          gutterBottom
        >
          Merging Images is an expensive process and takes time
        </Typography>
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
