// @flow
import React from 'react';
import {Icon} from 'flwww';
import Grid from '@material-ui/core/Grid';
import Logo from '../icons/Logo';
import DevicesIcon from '@material-ui/icons/Devices';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibraryOutlined';
import cx from 'classnames';

import styles from './styles.css';
import commonStyles from '../common.styles.css';
import {iconsColor} from '../../constants/colors';
import {
  DEVICE_MANAGER,
  SCREENSHOT_MANAGER,
} from '../../constants/DrawerContents';

const LeftIconsPane = props => {
  const iconProps = {
    color: iconsColor,
    style: {fontSize: 30},
    height: 30,
    width: 30,
  };
  return (
    <div className={styles.iconsContainer}>
      <div className={cx(styles.icon, styles.logo)}>
        <Logo width={40} height={40} />
      </div>
      <Grid
        container
        spacing={1}
        direction="column"
        alignItems="center"
        className={cx(styles.utilitySection)}
      >
        <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
          <div onClick={() => props.openDrawerAndSetContent(DEVICE_MANAGER)}>
            <DevicesIcon {...iconProps} />
          </div>
        </Grid>
        {/*<Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
          <div
            onClick={() => props.openDrawerAndSetContent(SCREENSHOT_MANAGER)}
          >
            <PhotoLibraryIcon {...iconProps} />
          </div>
        </Grid>*/}
      </Grid>
      <div
        id="headway"
        className={cx(styles.updates, commonStyles.icons, commonStyles.enabled)}
      >
        <Icon type="gift" color={iconsColor} />
      </div>
    </div>
  );
};

export default LeftIconsPane;
