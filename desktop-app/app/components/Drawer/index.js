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
import {iconsColor} from '../../constants/colors';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 'auto',
    '&:hover': {},
  },
  iconHover: {
    color: iconsColor,
    opacity: 0.8,
    borderRadius: '50%',
    '&:hover': {
      opacity: 1,
      background: '#8c8c8c42',
    },
  },
}));

export function Drawer(props) {
  const classes = useStyles();
  return (
    <div className={cx(styles.drawer, {[styles.open]: props.drawer.open})}>
      <div>
        <IconButton
          className={classes.root}
          onClick={() => props.changeDrawerOpenState(false)}
        >
          <ChevronLeftIcon className={classes.iconHover} />
        </IconButton>
      </div>
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
