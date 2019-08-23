// @flow
import React, {Component} from 'react';
import cx from 'classnames';
import Grid from '@material-ui/core/Grid';
import ScrollDownIcon from '../icons/ScrollDown';
import ScrollUpIcon from '../icons/ScrollUp';
import ScreenshotIcon from '../icons/Screenshot';

import styles from './styles.module.css';
import {iconsColor} from '../../constants/colors';

class ScrollControls extends Component {
  render() {
    const iconProps = {
      color: iconsColor,
      height: 25,
      width: 25,
    };
    console.log('ScrollControls this.props', this.props);
    return (
      <div className={styles.scrollControls}>
        <Grid container spacing={1}>
          <Grid item className={cx(styles.icons, styles.enabled)}>
            <div onClick={this.props.triggerScrollDown}>
              <ScrollDownIcon {...iconProps} />
            </div>
          </Grid>
          <Grid item className={cx(styles.icons, styles.enabled)}>
            <div onClick={this.props.triggerScrollUp}>
              <ScrollUpIcon {...iconProps} height={30} width={30} />
            </div>
          </Grid>
          <Grid item className={cx(styles.icons, styles.enabled)}>
            <div onClick={this.props.screenshotAllDevices}>
              <ScreenshotIcon {...iconProps} height={25} width={25} />
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default ScrollControls;
