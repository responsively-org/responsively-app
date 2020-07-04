// @flow
import React, {Component} from 'react';
import cx from 'classnames';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import ScrollDownIcon from '../icons/ScrollDown';
import ScrollUpIcon from '../icons/ScrollUp';
import ScreenshotIcon from '../icons/Screenshot';
import DeviceRotateIcon from '../icons/DeviceRotate';
import InspectElementIcon from '../icons/InspectElement';
import MutedIcon from '../icons/Muted';
import UnmutedIcon from '../icons/Unmuted';

import styles from './styles.module.css';
import commonStyles from '../common.styles.css';
import {iconsColor} from '../../constants/colors';
import ZoomContainer from '../../containers/ZoomContainer';
import PrefersColorSchemeSwitch from '../PrefersColorSchemeSwitch';
import ToggleTouch from '../ToggleTouch';
import Muted from '../icons/Muted';

const ScrollControls = ({
  browser,
  triggerScrollDown,
  triggerScrollUp,
  screenshotAllDevices,
  flipOrientationAllDevices,
  toggleInspector,
  onAllDevicesMutedChange,
}) => {
  const iconProps = {
    color: iconsColor,
    height: 25,
    width: 25,
  };
  return (
    <div className={styles.scrollControls}>
      <Grid container spacing={1} alignItems="center">
        <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
          <PrefersColorSchemeSwitch />
        </Grid>
        <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
          <Tooltip title="Scroll Down">
            <div onClick={triggerScrollDown}>
              <ScrollDownIcon {...iconProps} />
            </div>
          </Tooltip>
        </Grid>
        <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
          <Tooltip title="Scroll Up">
            <div onClick={triggerScrollUp}>
              <ScrollUpIcon {...iconProps} height={30} width={30} />
            </div>
          </Tooltip>
        </Grid>
        <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
          <Tooltip title="Take Screenshot">
            <div onClick={screenshotAllDevices}>
              <ScreenshotIcon {...iconProps} />
            </div>
          </Tooltip>
        </Grid>
        <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
          <Tooltip title="Tilt Devices">
            <div onClick={flipOrientationAllDevices}>
              <DeviceRotateIcon {...iconProps} />
            </div>
          </Tooltip>
        </Grid>
        <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
          <Tooltip title={browser.allDevicesMuted? "Unmute all devices": "Mute all devices"}>
            <div onClick={onAllDevicesMutedChange}>
              { browser.allDevicesMuted ? (<MutedIcon {...iconProps} />):(<UnmutedIcon {...iconProps} />) }
            </div>
          </Tooltip>
        </Grid>
        <Grid
          item
          className={cx(commonStyles.icons, commonStyles.enabled, {
            [commonStyles.selected]: browser.isInspecting,
          })}
        >
          <Tooltip title="Inspect Element">
            <div onClick={toggleInspector}>
              <InspectElementIcon
                {...{...iconProps, ...{height: 22, width: 22}}}
              />
            </div>
          </Tooltip>
        </Grid>
        <ToggleTouch />
        <ZoomContainer />
      </Grid>
    </div>
  );
};

export default ScrollControls;
