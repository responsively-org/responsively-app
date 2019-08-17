// @flow
import React, {Component} from 'react';
import Grid from '@material-ui/core/Grid';
import ScrollDownIcon from '../icons/ScrollDown';
import ScrollUpIcon from '../icons/ScrollUp';

import styles from './styles.module.css';
import {iconsColor} from '../../constants/colors';

class ScrollControls extends Component {
  render() {
    const iconProps = {
      color: iconsColor,
      height: 25,
      width: 25,
    };
    return (
      <div className={styles.scrollControls}>
        <Grid container spacing={1}>
          <Grid item className={styles.icons}>
            <div onClick={this.props.triggerScrollDown}>
              <ScrollDownIcon {...iconProps} />
            </div>
          </Grid>
          <Grid item className={styles.icons}>
            <div onClick={this.props.triggerScrollUp}>
              <ScrollUpIcon {...iconProps} height={30} width={30} />
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default ScrollControls;
