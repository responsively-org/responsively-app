import React from 'react';
import DesktopIcon from '@material-ui/icons/DesktopWindows';
import MobileIcon from '@material-ui/icons/SmartPhone';
import TabletIcon from '@material-ui/icons/TabletMac';
import {DEVICE_TYPE} from '../constants/devices';
import {iconsColor} from '../constants/colors';

export const getDeviceIcon = deviceType => {
  const iconProps = {
    color: iconsColor,
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
