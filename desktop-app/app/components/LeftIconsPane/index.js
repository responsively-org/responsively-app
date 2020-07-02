// @flow
import React, {useRef} from 'react';
import {Icon} from 'flwww';
import Grid from '@material-ui/core/Grid';
import Logo from '../icons/Logo';
import DevicesIcon from '@material-ui/icons/Devices';
import SettingsIcon from '@material-ui/icons/Settings';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibraryOutlined';
import ExtensionIcon from '@material-ui/icons/Extension';
import cx from 'classnames';

import styles from './styles.css';
import commonStyles from '../common.styles.css';
import {iconsColor} from '../../constants/colors';
import {
  DEVICE_MANAGER,
  SCREENSHOT_MANAGER,
  USER_PREFERENCES,
  EXTENSIONS_MANAGER,
} from '../../constants/DrawerContents';

const LeftIconsPane = props => {
  const headwayRef = useRef();
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
          className={cx(commonStyles.icons, styles.icon, commonStyles.enabled, {
            [commonStyles.selected]:
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
          className={cx(commonStyles.icons, styles.icon, commonStyles.enabled, {
            [commonStyles.selected]:
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
          className={cx(commonStyles.icons, styles.icon, commonStyles.enabled, {
            [commonStyles.selected]:
            props.drawer.open && props.drawer.content === EXTENSIONS_MANAGER,
          })}
          onClick={() => toggleState(EXTENSIONS_MANAGER)}
        >
          <div>
            <ExtensionIcon {...iconProps} className="extensionsIcon" />
          </div>
        </Grid>
      </Grid>
      <div style={{position: 'relative'}}>
        <div
          id="headway"
          ref={headwayRef}
          className={cx(
            styles.updates,
            commonStyles.icons,
            commonStyles.enabled
          )}
        />
      </div>
    </div>
  );
};

export default LeftIconsPane;
