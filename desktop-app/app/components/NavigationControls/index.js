// @flow
import React, {Component} from 'react';
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
    return (
      <div className={styles.navigationControls}>
        <Grid container spacing={1} alignItems="center">
          <Grid item className={styles.icons}>
            <div onClick={this.props.triggerNavigationBack}>
              <ArrowLeftIcon {...iconProps} />
            </div>
          </Grid>
          <Grid item className={styles.icons}>
            <div onClick={this.props.triggerNavigationForward}>
              <ArrowRightIcon {...iconProps} />
            </div>
          </Grid>
          <Grid item className={styles.icons}>
            <div onClick={this.props.triggerNavigationReload}>
              <ReloadIcon {...iconProps} height={15} width={15} />
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default NavigationControls;
