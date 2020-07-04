import React, {useState, useEffect} from 'react';
import cx from 'classnames';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import {iconsColor} from '../../constants/colors';
import ToggleTouchIcon from '../icons/ToggleTouch';

import commonStyles from '../common.styles.css';

export default function ToggleTouch() {
  const [isTouchMode, setIsTouchMode] = useState(false);
  const [isHover, setHover] = useState(false);
  const [hasPendingState, setPendingState] = useState(false);

  useEffect(() => {
    const handler = e => {
      if (isTouchMode && e.key === 'Escape') {
        handleToggleTouch();
      }
    };

    document.addEventListener('keydown', handler);

    return () => document.removeEventListener('keydown', handler);
  }, [isTouchMode, isHover]);

  const handleToggleTouch = () => {
    setIsTouchMode(!isTouchMode);
    if (isHover) {
      return setPendingState(true);
    }
    return syncState(!isTouchMode);
  };

  const syncState = isTouchMode => {
    const {BrowserWindow} = require('electron').remote;
    const contents = BrowserWindow.getFocusedWindow().webContents;

    if (!contents.debugger.isAttached()) {
      contents.debugger.attach('1.3');
    }
    contents.debugger.sendCommand('Emulation.setEmitTouchEventsForMouse', {
      enabled: isTouchMode,
    });
  };

  const iconProps = {
    color: iconsColor,
    height: 25,
    width: 25,
  };

  return (
    <Grid
      item
      className={cx(commonStyles.icons, commonStyles.enabled, {
        [commonStyles.selected]: isTouchMode,
      })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        if (!hasPendingState) {
          return;
        }
        syncState(isTouchMode);
        setPendingState(false);
      }}
    >
      <Tooltip title="Toggle Touch Mode">
        <div onClick={handleToggleTouch}>
          <ToggleTouchIcon {...iconProps} />
        </div>
      </Tooltip>
    </Grid>
  );
}
