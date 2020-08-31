import React, {useState} from 'react';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import {useTheme} from '@material-ui/core/styles';
import FolderOpenIcon from '@material-ui/icons/FolderOpenOutlined';
import InputAdornment from '@material-ui/core/InputAdornment';
import {ipcRenderer} from 'electron';
import useStyles from '../UserPreferences/useStyles';

function ScreenShotSavePreference({
  onScreenShotSaveLocationChange,
  screenShotSavePath,
}) {
  const theme = useTheme();
  const classes = useStyles();
  const getScreenshotSavePath = async event => {
    const screenshotSavePathResponseFromIpc = await ipcRenderer.invoke(
      'get-screen-shot-save-path'
    );
    if (screenshotSavePathResponseFromIpc) {
      onScreenShotSaveLocationChange(
        'screenShotSavePath',
        screenshotSavePathResponseFromIpc
      );
    }
  };

  return (
    <div>
      <div className={classes.preferenceName}>Save Location:</div>
      <TextField
        className={classes.marginTop}
        type="text"
        color="secondary"
        id="standard-size-small"
        value={screenShotSavePath}
        placeholder="Screenshot save path"
        variant="outlined"
        InputProps={{
          endAdornment: (
            <InputAdornment>
              <IconButton
                onClick={getScreenshotSavePath}
                size="small"
                title="Select Screenshots save location"
              >
                <FolderOpenIcon
                  fontSize="small"
                  htmlColor={theme.palette.lightIcon.main}
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
}

export default ScreenShotSavePreference;
