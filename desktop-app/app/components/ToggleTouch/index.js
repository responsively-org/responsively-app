import React, {useState, useEffect} from 'react';
import cx from 'classnames';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import ToggleTouchIcon from '../icons/ToggleTouch';
import useCommonStyles from '../useCommonStyles';

export default function ToggleTouch({iconProps}) {
  const [isTouchMode, setIsTouchMode] = useState(false);
  const [isHover, setHover] = useState(false);
  const [hasPendingState, setPendingState] = useState(false);
  const commonClasses = useCommonStyles();

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

  return (
    <Grid
      item
      className={cx(commonClasses.icon, {
        [commonClasses.iconSelected]: isTouchMode,
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
