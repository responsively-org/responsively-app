// @flow
import React from 'react';
import MaterialDrawer from '@material-ui/core/Drawer';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DeviceManagerContainer from '../../containers/DeviceManagerContainer';
import cx from 'classnames';

import styles from './styles.css';
import {DEVICE_MANAGER} from '../../constants/DrawerContents';

export function Drawer(props) {
  console.log('props', props);
  return (
    <div className={cx(styles.drawer, {[styles.open]: props.drawer.open})}>
      {getDrawerContent(props.drawer.content)}
    </div>
  );
}

const deviceManagerComponent = <DeviceManagerContainer />;

function getDrawerContent(type) {
  switch (type) {
    case DEVICE_MANAGER:
      return deviceManagerComponent;
  }
}

export default Drawer;
