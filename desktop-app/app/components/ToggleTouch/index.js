import React, {useState} from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import {iconsColor} from '../../constants/colors';
import ToggleTouchIcon from '../icons/ToggleTouch';

export default function ToggleTouch() {
  const [isTouchMode, setIsTouchMode] = useState(false);

  const handleToggleTouch = () => {
    const {BrowserWindow} = require('electron').remote;
    const contents = BrowserWindow.getFocusedWindow().webContents;

    if (isTouchMode) {
      if (!contents.debugger.isAttached()) {
        contents.debugger.attach('1.3');
      }
      contents.debugger.sendCommand('Emulation.setEmitTouchEventsForMouse', {
        enabled: true,
      });
    } else {
      contents.debugger.sendCommand('Emulation.setEmitTouchEventsForMouse', {
        enabled: false,
      });
    }
    setIsTouchMode(!isTouchMode);
  };

  const iconProps = {
    color: iconsColor,
    height: 25,
    width: 25,
  };

  return (
    <Tooltip title="Toggle Touch Mode">
      <div onClick={handleToggleTouch}>
        <ToggleTouchIcon {...iconProps} />
      </div>
    </Tooltip>
  );
}
