import React from 'react';
import DesktopIcon from '@material-ui/icons/DesktopWindows';
import MobileIcon from '@material-ui/icons/Smartphone';
import TabletIcon from '@material-ui/icons/TabletMac';
import {DEVICE_TYPE} from '../constants/devices';

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
