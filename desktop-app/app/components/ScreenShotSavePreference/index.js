import React, {useState} from 'react';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import FolderOpenIcon from '@material-ui/icons/FolderOpenOutlined';
import InputAdornment from '@material-ui/core/InputAdornment';
import {ipcRenderer} from 'electron';
import {lightIconsColor} from '../../constants/colors';
import styles from '../UserPreferences/styles.module.css';
import cx from 'classnames';

export default function ScreenShotSavePreference({
  onScreenShotSaveLocationChange,
  screenShotSavePath,
}) {
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
    <div className={cx(styles.screenshotLocationInputContainer)}>
      <div className={cx(styles.sectionTitle)}>Screenshot Location:</div>
      <TextField
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
                <FolderOpenIcon fontSize="small" htmlColor={lightIconsColor} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
}
