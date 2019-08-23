// @flow
import React, {Component} from 'react';
import cx from 'classnames';
import Grid from '@material-ui/core/Grid';
import ArrowLeftIcon from '../icons/ArrowLeft';
import ArrowRightIcon from '../icons/ArrowRight';
import ReloadIcon from '../icons/Reload';

import styles from './styles.module.css';
import {iconsColor} from '../../constants/colors';

class NavigationControls extends Component {
  render() {
    const iconProps = {
      color: iconsColor,
      height: 25,
      width: 25,
    };
    const {backEnabled, forwardEnabled} = this.props;
    return (
      <div className={styles.navigationControls}>
        <Grid container spacing={1} alignItems="center">
          <Grid
            item
            className={cx(styles.icons, {
              [styles.disabled]: !backEnabled,
              [styles.enabled]: backEnabled,
            })}
          >
            <div
              className={cx(styles.iconDisabler, {
                [styles.disabled]: !backEnabled,
              })}
            />
            <div onClick={this.props.triggerNavigationBack}>
              <ArrowLeftIcon {...iconProps} />
            </div>
          </Grid>
          <Grid
            item
            className={cx(styles.icons, {
              [styles.disabled]: !forwardEnabled,
              [styles.enabled]: forwardEnabled,
            })}
          >
            <div
              className={cx(styles.iconDisabler, {
                [styles.disabled]: !forwardEnabled,
              })}
            />
            <div onClick={this.props.triggerNavigationForward}>
              <ArrowRightIcon {...iconProps} />
            </div>
          </Grid>
          <Grid item className={cx(styles.icons, styles.enabled)}>
            <div onClick={this.props.triggerNavigationReload}>
              <ReloadIcon {...iconProps} height={15} width={15} padding={5} />
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default NavigationControls;
