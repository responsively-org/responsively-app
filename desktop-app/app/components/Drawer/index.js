// @flow
import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import cx from 'classnames';
import DeviceDrawerContainer from '../../containers/DeviceDrawerContainer';
import UserPreferencesContainer from '../../containers/UserPreferencesContainer';
import ExtensionsManagerContainer from '../../containers/ExtensionsManagerContainer';

import styles from './styles.css';
import commonStyles from '../common.styles.css';
import {
  DEVICE_MANAGER,
  USER_PREFERENCES,
  EXTENSIONS_MANAGER,
} from '../../constants/DrawerContents';
import {iconsColor} from '../../constants/colors';
import DoubleLeftArrowIcon from '../icons/DoubleLeftArrow';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '0 0 10px',
    '&:hover': {},
  },
  iconHover: {
    color: iconsColor,
    opacity: 0.8,
    borderRadius: '50%',
    '&:hover': {
      opacity: 1,
      color: '#8c8c8c42',
    },
  },
}));

export function Drawer(props) {
  const classes = useStyles();
  return (
    <div className={cx(styles.drawer, {[styles.open]: props.drawer.open})}>
      <div
        className={classes.root}
        onClick={() => props.changeDrawerOpenState(false)}
      >
        <div
          className={cx(
            commonStyles.flexContainer,
            commonStyles.icons,
            commonStyles.enabled
          )}
          onClick={() => props.changeDrawerOpenState(false)}
        >
          <DoubleLeftArrowIcon color="white" height={30} />
        </div>
        {/* <Icon type="chevronsLeft" title="Close Drawer" color="white" className={classes.iconHover} /> */}
        {/* <ChevronLeftIcon className={classes.iconHover} /> */}
      </div>
      <div className={styles.contentContainer}>
        {getDrawerContent(props.drawer.content)}
      </div>
    </div>
  );
}

function getDrawerContent(type) {
  switch (type) {
    case DEVICE_MANAGER:
      return <DeviceDrawerContainer />;
    case USER_PREFERENCES:
      return <UserPreferencesContainer />;
    case EXTENSIONS_MANAGER:
      return <ExtensionsManagerContainer />;
    default:
      return null;
  }
}

export default Drawer;
