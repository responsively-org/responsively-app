// @flow
import React, {Component} from 'react';
import cx from 'classnames';
import Grid from '@material-ui/core/Grid';
import {ipcRenderer} from 'electron';
import {Icon} from 'flwww';
import {Tooltip} from '@material-ui/core';
import HomeIcon from '../icons/Home';

import styles from './styles.module.css';
import commonStyles from '../common.styles.css';
import {iconsColor} from '../../constants/colors';
import Cross from '../icons/Cross';
import Reload from '../icons/Reload';

class NavigationControls extends Component {
  componentDidMount() {
    ipcRenderer.on('reload-url', this.props.triggerNavigationReload);
    ipcRenderer.on('reload-css', this.props.reloadCSS);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(
      'reload-url',
      this.props.triggerNavigationReload
    );
    ipcRenderer.removeListener('reload-css', this.props.reloadCSS);
  }

  render() {
    const iconProps = {
      color: iconsColor,
      height: 25,
      width: 25,
    };
    const {backEnabled, forwardEnabled} = this.props;
    const deviceLoading = (this.props.devices || []).find(
      device => device.loading
    );

    let refreshOrCancel;
    if (deviceLoading) {
      refreshOrCancel = (
        <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
          <Tooltip title="Stop loading this page">
            <div
              className={commonStyles.flexAlignVerticalMiddle}
              onClick={this.props.triggerStopLoading}
            >
              <Cross {...iconProps} padding={6} height={24} width={24} />
            </div>
          </Tooltip>
        </Grid>
      );
    } else {
      refreshOrCancel = (
        <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
          <Tooltip title="Reload">
            <div
              className={commonStyles.flexAlignVerticalMiddle}
              onClick={this.props.triggerNavigationReload}
            >
              <Reload {...iconProps} padding={4} height={24} width={24} />
            </div>
          </Tooltip>
        </Grid>
      );
    }
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
                {/* <ArrowRightIcon {...iconProps} /> */}
              </div>
            </Tooltip>
          </Grid>

          {refreshOrCancel}

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
