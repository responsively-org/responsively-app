import React from 'react';
import MobileIcon from '@material-ui/icons/Smartphone';
import AndroidIcon from '@material-ui/icons/Android';
import DesktopIcon from '@material-ui/icons/DesktopWindows';
import {useTheme} from '@material-ui/core/styles';
import AppleIcon from '../icons/Apple';
import WindowsIcon from '../icons/Windows';
import {OS} from '../../constants/devices';

function OSIcon({os, color}) {
  const theme = useTheme();
  const _color = color || theme.palette.text.primary;
  const iconProps = {
    style: {fontSize: 'inherit', paddingRight: 2, _color},
    height: '1em',
  };

  switch (os) {
    case OS.ios:
      return <AppleIcon {...iconProps} color={_color} />;
    case OS.android:
      return <AndroidIcon {...iconProps} />;
    case OS.windowsPhone:
      return <WindowsIcon {...iconProps} height="0.8em" color={_color} />;
    case OS.pc:
      return <DesktopIcon {...iconProps} />;
    default:
      return null;
  }
}

export default OSIcon;
