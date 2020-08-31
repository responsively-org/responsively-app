import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import cx from 'classnames';
import DeviceDrawerContainer from '../containers/DeviceDrawerContainer';
import UserPreferencesContainer from '../containers/UserPreferencesContainer';
import ExtensionsManagerContainer from '../containers/ExtensionsManagerContainer';
import NetworkConfigurationContainer from '../containers/NetworkConfigurationContainer';
import useCommonStyles from './useCommonStyles';
import {
  DEVICE_MANAGER,
  USER_PREFERENCES,
  EXTENSIONS_MANAGER,
  NETWORK_CONFIGURATION,
} from '../constants/DrawerContents';
import DoubleLeftArrowIcon from './icons/DoubleLeftArrow';

function Drawer(props) {
  const classes = useStyles();
  const commonClasses = useCommonStyles();

  return (
    <div
      className={cx(classes.drawer, {[classes.drawerOpen]: props.drawer.open})}
    >
      <div
        className={classes.root}
        onClick={() => props.changeDrawerOpenState(false)}
      >
        <div
          className={cx(commonClasses.flexContainer, commonClasses.icon)}
          onClick={() => props.changeDrawerOpenState(false)}
        >
          <DoubleLeftArrowIcon color="currentColor" height={30} />
        </div>
      </div>
      <div>{getDrawerContent(props.drawer.content)}</div>
    </div>
  );
}

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '0 0 10px',
  },
  drawer: {
    width: '310px',
    overflow: 'hidden',
    transition: 'margin-left 0.2s',
    background: theme.palette.header.main,
    margin: '0 10px 0 -310px',
    padding: '5px 5px 0 5px',
  },
  drawerOpen: {
    marginLeft: 0,
    flexShrink: 0,
    boxShadow: `${theme.palette.mode({
      light: '0px 2px 4px',
      dark: '5px 7px 5px',
    })} 0 rgba(0, 0, 0, 0.75)`,
  },
}));

function getDrawerContent(type) {
  switch (type) {
    case DEVICE_MANAGER:
      return <DeviceDrawerContainer />;
    case USER_PREFERENCES:
      return <UserPreferencesContainer />;
    case EXTENSIONS_MANAGER:
      return <ExtensionsManagerContainer />;
    case NETWORK_CONFIGURATION:
      return <NetworkConfigurationContainer />;
    default:
      return null;
  }
}

export default Drawer;
