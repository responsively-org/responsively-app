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

import styles from './styles.css';
import useCommonStyles from '../useCommonStyles';
import {
  DEVICE_MANAGER,
  SCREENSHOT_MANAGER,
  USER_PREFERENCES,
  EXTENSIONS_MANAGER,
  NETWORK_CONFIGURATION,
} from '../../constants/DrawerContents';

const LeftIconsPane = props => {
  const commonClasses = useCommonStyles();
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
    <div className={styles.iconsContainer}>
      <div className={cx(styles.logo, styles.icon)}>
        <Logo width={40} height={40} />
      </div>
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
          <div>
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
          <div>
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
          <div>
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
          <div>
            <NetworkIcon
              {...iconProps}
              color="currentColor"
              className="networkIcon"
            />
          </div>
        </Grid>
      </Grid>
      <Headway />
    </div>
  );
};

export default LeftIconsPane;
