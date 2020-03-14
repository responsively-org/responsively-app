// @flow
import React, {Component} from 'react';
import cx from 'classnames';
import Grid from '@material-ui/core/Grid';
import ArrowLeftIcon from '../icons/ArrowLeft';
import ArrowRightIcon from '../icons/ArrowRight';
import ReloadIcon from '../icons/Reload';
import HomeIcon from '../icons/Home';
import {Icon} from 'flwww';

import styles from './styles.module.css';
import commonStyles from '../common.styles.css';
import {iconsColor} from '../../constants/colors';
import {Tooltip} from '@material-ui/core';

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
            className={cx(commonStyles.icons, {
              [commonStyles.disabled]: !backEnabled,
              [commonStyles.enabled]: backEnabled,
            })}
          >
            <div
              className={cx(commonStyles.iconDisabler, {
                [commonStyles.disabled]: !backEnabled,
              })}
            />
            <Tooltip title="Back">
              <div onClick={this.props.triggerNavigationBack}>
                <Icon type="arrowLeft" size="30px" {...iconProps} />
                {/*<ArrowLeftIcon {...iconProps} />*/}
              </div>
            </Tooltip>
          </Grid>
          <Grid
            item
            className={cx(commonStyles.icons, {
              [commonStyles.disabled]: !forwardEnabled,
              [commonStyles.enabled]: forwardEnabled,
            })}
          >
            <div
              className={cx(commonStyles.iconDisabler, {
                [commonStyles.disabled]: !forwardEnabled,
              })}
            />
            <Tooltip title="Forward">
              <div onClick={this.props.triggerNavigationForward}>
                <Icon type="arrowRight" size="30px" {...iconProps} />
                {/*<ArrowRightIcon {...iconProps} />*/}
              </div>
            </Tooltip>
          </Grid>
          <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
            <Tooltip title="Reload">
              <div
                onClick={this.props.triggerNavigationReload}
                style={{transform: 'rotate(90deg)'}}
              >
                <Icon type="rotate" {...iconProps} />
                {/*<ReloadIcon {...iconProps} height={15} width={15} padding={5} />*/}
              </div>
            </Tooltip>
          </Grid>
          <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
            <Tooltip title="Go to Homepage">
              <div
                className={commonStyles.flexAlignVerticalMiddle}
                onClick={this.props.goToHomepage}
              >
                <HomeIcon {...iconProps} padding={5} />
              </div>
            </Tooltip>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default NavigationControls;
