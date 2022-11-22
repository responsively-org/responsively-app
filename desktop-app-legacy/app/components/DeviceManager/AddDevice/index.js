import React, {Fragment, useState} from 'react';
import cx from 'classnames';
import Dialog from '@material-ui/core/Dialog';
import {green} from '@material-ui/core/colors';
import DialogContentText from '@material-ui/core/DialogContentText';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import AddIcon from '@material-ui/icons/Add';
import InputAdornment from '@material-ui/core/InputAdornment';
import Input from '@material-ui/core/Input';
import FormLabel from '@material-ui/core/FormLabel';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {Typography, Grid, MenuItem, NativeSelect} from '@material-ui/core';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Switch from 'react-switch';
import {
  DEVICE_TYPE,
  CAPABILITIES,
  OS,
  SOURCE,
} from '../../../constants/devices';

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
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  select: {
    marginTop: theme.spacing(2),
    maxWidth: 150,
  },
  radioIcon: {
    color: theme.palette.lightIcon.main,
  },
  inputAdornment: {
    color: theme.palette.lightIcon.main,
  },
  userAgent: {
    fontSize: 12,
  },
  actionButton: {
    padding: '10px !important',
    borderRadius: '5px !important',
  },
}));

export default function AddDevice(props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(600);
  const [userAgentString, setUserAgentString] = useState('');
  const theme = useTheme();
  const [previewState, setPreviewState] = useState(true);
  const [capabilities, setCapabilities] = useState({
    [CAPABILITIES.mobile]: false,
    [CAPABILITIES.touch]: true,
    [CAPABILITIES.responsive]: false,
  });
  const [deviceType, setDeviceType] = useState(DEVICE_TYPE.phone);
  const [os, setOS] = useState(OS.android);
  const classes = useStyles();

  const updateUserAgent = () => {
    let userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36';
    if (os === OS.android) {
      if (deviceType === DEVICE_TYPE.phone) {
        userAgent =
          'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36';
      }
      if (deviceType === DEVICE_TYPE.tablet) {
        userAgent =
          'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 10 Build/MOB31T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Safari/537.36';
      }
    }
    if (os === OS.ios) {
      if (deviceType === DEVICE_TYPE.phone) {
        userAgent =
          'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1';
      }
      if (deviceType === DEVICE_TYPE.tablet) {
        userAgent =
          'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1';
      }
    }

    if (os === OS.windowsPhone) {
      userAgent =
        'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 520)';
    }

    setUserAgentString(userAgent);
  };

  React.useEffect(updateUserAgent, [os, deviceType]);

  const CustomRadio = props => (
    <Radio
      {...props}
      color="primary"
      icon={<RadioButtonUncheckedIcon className={classes.radioIcon} />}
      checkedIcon={<RadioButtonCheckedIcon className={classes.radioIcon} />}
    />
  );

  const CustomCheckbox = props => (
    <Checkbox
      {...props}
      color="primary"
      icon={<CheckBoxOutlineBlankIcon className={classes.radioIcon} />}
      checkedIcon={<CheckBoxIcon className={classes.radioIcon} />}
    />
  );

  const closeDialog = () => setOpen(false);

  const saveDevice = () => {
    props.addCustomDevice({
      name,
      width: parseInt(width, 10),
      height: parseInt(height, 10),
      added: previewState,
      useragent: userAgentString,
      id: `custom-${new Date().getTime()}`,
      type: deviceType,
      capabilities: Object.keys(capabilities).filter(val => capabilities[val]),
      os,
      source: SOURCE.custom,
    });
    closeDialog();
    setName('');
    setWidth(400);
    setHeight(600);
    setPreviewState(true);
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
        disableEnforceFocus
        open={open}
        onClose={closeDialog}
        aria-labelledby="form-dialog-title"
        fullWidth
      >
        <DialogTitle id="form-dialog-title">New Device</DialogTitle>
        <DialogContent>
          <DialogContentText color="textPrimary">
            Please enter the details of the new device
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            margin="normal"
            label="Name"
            type="text"
            placeholder="Device name"
            InputLabelProps={{
              shrink: true,
            }}
            value={name}
            onChange={e => setName(e.target.value)}
            className="padded-input"
          />
          <TextField
            className={classes.inputField}
            variant="outlined"
            margin="normal"
            label="Width"
            type="number"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" className="input-adornment">
                  px
                </InputAdornment>
              ),
            }}
            value={width}
            onChange={e => setWidth(e.target.value)}
            className="padded-input"
          />
          <TextField
            className={classes.inputField}
            variant="outlined"
            margin="normal"
            label="Height"
            type="number"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" className="input-adornment">
                  px
                </InputAdornment>
              ),
            }}
            value={height}
            onChange={e => setHeight(e.target.value)}
            className="padded-input"
          />
          <FormControl
            component="fieldset"
            className={classes.formControl}
            fullWidth
          >
            <FormLabel component="legend">Device Type</FormLabel>
            <RadioGroup
              name="deviceType"
              value={deviceType}
              onChange={e => setDeviceType(e.target.value)}
            >
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <FormControlLabel
                    value={DEVICE_TYPE.phone}
                    control={<CustomRadio />}
                    label="Phone"
                  />
                </Grid>
                <Grid item>
                  <FormControlLabel
                    value={DEVICE_TYPE.tablet}
                    control={<CustomRadio />}
                    label="Tablet"
                  />
                </Grid>
                <Grid item>
                  <FormControlLabel
                    value={DEVICE_TYPE.desktop}
                    control={<CustomRadio />}
                    label="Laptop/Desktop"
                  />
                </Grid>
              </Grid>
            </RadioGroup>
          </FormControl>
          <FormControl
            component="fieldset"
            className={classes.formControl}
            fullWidth
          >
            <FormLabel component="legend">Operating System</FormLabel>
            <RadioGroup
              name="os"
              value={os}
              onChange={e => setOS(e.target.value)}
            >
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <FormControlLabel
                    value={OS.android}
                    control={<CustomRadio />}
                    label="Android"
                  />
                </Grid>
                <Grid item>
                  <FormControlLabel
                    value={OS.ios}
                    control={<CustomRadio />}
                    label="iOS"
                  />
                </Grid>
                <Grid item>
                  <FormControlLabel
                    value={OS.windowsPhone}
                    control={<CustomRadio />}
                    label="Windows Phone"
                  />
                </Grid>
                <Grid item>
                  <FormControlLabel
                    value={OS.pc}
                    control={<CustomRadio />}
                    label="Desktop"
                  />
                </Grid>
              </Grid>
            </RadioGroup>
          </FormControl>
          <FormLabel>Device capabilities</FormLabel>
          <FormGroup>
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <FormControlLabel
                  control={
                    <CustomCheckbox
                      checked={capabilities[CAPABILITIES.mobile]}
                      onChange={e =>
                        setCapabilities({
                          ...capabilities,
                          [CAPABILITIES.mobile]: e.target.checked,
                        })
                      }
                      value="Flippable"
                    />
                  }
                  label="Flippable"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <CustomCheckbox
                      checked={capabilities[CAPABILITIES.touch]}
                      onChange={e =>
                        setCapabilities({
                          ...capabilities,
                          [CAPABILITIES.touch]: e.target.checked,
                        })
                      }
                      value="Touchscreen"
                    />
                  }
                  label="Touchscreen"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <CustomCheckbox
                      checked={capabilities[CAPABILITIES.responsive]}
                      onChange={e =>
                        setCapabilities({
                          ...capabilities,
                          [CAPABILITIES.responsive]: e.target.checked,
                        })
                      }
                      value="Responsive"
                    />
                  }
                  label="Responsive"
                />
              </Grid>
            </Grid>
          </FormGroup>
          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            label="User-Agent String"
            placeholder="User-Agent String"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              classes: {
                input: classes.userAgent,
              },
            }}
            type="text"
            value={userAgentString}
            onChange={e => setUserAgentString(e.target.value)}
            className={cx('padded-input')}
          />

          <Grid
            container
            alignItems="center"
            className="MuiFormControl-marginNormal"
          >
            <Grid item style={{flex: 1}} className="MuiFormLabel-root">
              Activate Preview
            </Grid>
            <Grid
              item
              className={cx('MuiFormLabel-root', {
                'Mui-focused': !previewState,
              })}
            >
              {/* Off */}
            </Grid>
            <Grid item>
              <Switch
                onChange={checked => setPreviewState(checked)}
                checked={previewState}
                onColor={theme.palette.primary.main}
              />
            </Grid>
            <Grid
              item
              className={cx('MuiFormLabel-root', {
                'Mui-focused': previewState,
              })}
            >
              {/* On */}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeDialog}
            color="primary"
            className={classes.actionButton}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveDevice}
            color="primary"
            className={classes.actionButton}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
