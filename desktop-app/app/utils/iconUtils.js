import React from 'react';
import DesktopIcon from '@material-ui/icons/DesktopWindows';
import MobileIcon from '@material-ui/icons/Smartphone';
import TabletIcon from '@material-ui/icons/TabletMac';
import AndroidIcon from '@material-ui/icons/Android';
import {DEVICE_TYPE, OS} from '../constants/devices';
import {iconsColor} from '../constants/colors';
import AppleIcon from '../components/icons/Apple';
import WindowsIcon from '../components/icons/Windows';

export const getDeviceIcon = deviceType => {
  const iconProps = {
    style: {fontSize: 'inherit', paddingRight: 2},
  };
  switch (deviceType) {
    case DEVICE_TYPE.phone:
      return <MobileIcon {...iconProps} />;
    case DEVICE_TYPE.tablet:
      return <TabletIcon {...iconProps} />;
    case DEVICE_TYPE.desktop:
      return <DesktopIcon {...iconProps} />;
    default:
      return null;
  }
};

export const getOSIcon = (os, _color) => {
  const color = _color || iconsColor;
  const iconProps = {
    style: {fontSize: 'inherit', paddingRight: 2, color},
    height: '1em',
  };
  switch (os) {
    case OS.ios:
      return <AppleIcon {...iconProps} color={color} />;
    case OS.android:
      return <AndroidIcon {...iconProps} />;
    case OS.windowsPhone:
      return <WindowsIcon {...iconProps} height="0.8em" color={color} />;
    case OS.pc:
      return <DesktopIcon {...iconProps} />;
    default:
      return null;
  }
};
