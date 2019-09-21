// @flow
import React, {Component} from 'react';
import cx from 'classnames';
import Grid from '@material-ui/core/Grid';
import ScrollDownIcon from '../icons/ScrollDown';
import ScrollUpIcon from '../icons/ScrollUp';
import ScreenshotIcon from '../icons/Screenshot';
import DeviceRotateIcon from '../icons/DeviceRotate';
import InspectElementIcon from '../icons/InspectElement';

import styles from './styles.module.css';
import commonStyles from '../common.styles.css';
import {iconsColor} from '../../constants/colors';
import ZoomContainer from '../../containers/ZoomContainer';

class ScrollControls extends Component {
  render() {
    const iconProps = {
      color: iconsColor,
      height: 25,
      width: 25,
    };
    return (
      <div className={styles.scrollControls}>
        <Grid container spacing={1} alignItems="center">
          <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
            <div onClick={this.props.triggerScrollDown}>
              <ScrollDownIcon {...iconProps} />
            </div>
          </Grid>
          <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
            <div onClick={this.props.triggerScrollUp}>
              <ScrollUpIcon {...iconProps} height={30} width={30} />
            </div>
          </Grid>
          <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
            <div onClick={this.props.screenshotAllDevices}>
              <ScreenshotIcon {...iconProps} />
            </div>
          </Grid>
          <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
            <div onClick={this.props.flipOrientationAllDevices}>
              <DeviceRotateIcon {...iconProps} />
            </div>
          </Grid>
          <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
            <div onClick={this.props.enableInpector}>
              <InspectElementIcon {...iconProps} />
            </div>
          </Grid>
          <ZoomContainer />
        </Grid>
      </div>
    );
  }
}

export default ScrollControls;
