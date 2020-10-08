import React from 'react';
import Grid from '@material-ui/core/Grid';
import DevicesIcon from '@material-ui/icons/Devices';
import SettingsIcon from '@material-ui/icons/Settings';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibraryOutlined';
import ExtensionIcon from '@material-ui/icons/Extension';
import cx from 'classnames';
import NetworkIcon from '../icons/Network';
import Logo from '../icons/Logo';
import Gift from '../icons/Gift';
import Headway from '../Headway';
import ZenButton from '../ZenButton';

import styles from './styles.css';
import useCommonStyles from '../useCommonStyles';
import {
  DEVICE_MANAGER,
  SCREENSHOT_MANAGER,
  USER_PREFERENCES,
  EXTENSIONS_MANAGER,
  NETWORK_CONFIGURATION,
} from '../../constants/DrawerContents';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  container: {
    position: 'relative',
    backgroundColor: theme.palette.background.l2,
    display: 'flex',
    flexFlow: 'column',
    marginTop: '-50px',
    paddingTop: '50px',
    width: 50,
    boxShadow: `0 ${theme.palette.mode({
      light: '3px',
      dark: '3px',
    })} 5px rgba(0, 0, 0, 0.35)`,
    zIndex: 1,
    transform: 'translateX(0)',
    transition: 'transform .1s ease-out',
    '& .zenButton': {
      position: 'absolute',
      background: theme.palette.background.l2,
      top: '50%',
      right: '0',
      transformOrigin: 'center',
      transform: 'translate(100%, -50%) rotate(-90deg) translateY(-30px)',
      display: 'none',
    },
    '&:hover .zenButton': {
      display: 'flex',
    },
    '&.zenMode': {
      transform: 'translateX(-100%)',
    },
    '&.zenMode .zenButton': {
      display: 'flex',
    },
  },
  leftPaneIcon: {
    '& svg': {
      verticalAlign: 'middle',
    },
  },
}));

const LeftIconsPane = props => {
  const commonClasses = useCommonStyles();
  const mStyles = useStyles();
  const iconProps = {
    style: {fontSize: 30},
    height: 30,
    width: 30,
  };
  const toggleState = content => {
    if (props.drawer.open && props.drawer.content === content) {
      return props.changeDrawerOpenState(false);
    }

    props.openDrawerAndSetContent(content);
  };
  return (
    <div
      className={`${mStyles.container} ${
        props.isLeftPaneVisible ? '' : 'zenMode'
      }`}
    >
      <Grid
        container
        spacing={1}
        direction="column"
        alignItems="center"
        className={cx(styles.utilitySection)}
      >
        <Grid
          item
          className={cx(commonClasses.icon, styles.icon, {
            [commonClasses.iconSelected]:
              props.drawer.open && props.drawer.content === DEVICE_MANAGER,
          })}
          onClick={() => toggleState(DEVICE_MANAGER)}
        >
          <div className={cx(mStyles.leftPaneIcon)}>
            <DevicesIcon {...iconProps} className="deviceManagerIcon" />
          </div>
        </Grid>
        <Grid
          item
          className={cx(commonClasses.icon, styles.icon, {
            [commonClasses.iconSelected]:
              props.drawer.open && props.drawer.content === USER_PREFERENCES,
          })}
          onClick={() => toggleState(USER_PREFERENCES)}
        >
          <div className={cx(mStyles.leftPaneIcon)}>
            <SettingsIcon {...iconProps} className="settingsIcon" />
          </div>
        </Grid>
        <Grid
          item
          className={cx(commonClasses.icon, styles.icon, {
            [commonClasses.iconSelected]:
              props.drawer.open && props.drawer.content === EXTENSIONS_MANAGER,
          })}
          onClick={() => toggleState(EXTENSIONS_MANAGER)}
        >
          <div className={cx(mStyles.leftPaneIcon)}>
            <ExtensionIcon {...iconProps} className="extensionsIcon" />
          </div>
        </Grid>
        <Grid
          item
          className={cx(commonClasses.icon, styles.icon, {
            [commonClasses.iconSelected]:
              props.drawer.open &&
              props.drawer.content === NETWORK_CONFIGURATION,
          })}
          onClick={() => toggleState(NETWORK_CONFIGURATION)}
        >
          <div className={cx(mStyles.leftPaneIcon)}>
            <NetworkIcon
              {...iconProps}
              color="currentColor"
              className="networkIcon"
            />
          </div>
        </Grid>
      </Grid>
      <Headway />
      {!props.drawer.open && (
        <ZenButton
          active={!props.isLeftPaneVisible}
          onClick={() => props.setLeftPaneVisibility(!props.isLeftPaneVisible)}
        />
      )}
    </div>
  );
};

export default LeftIconsPane;
