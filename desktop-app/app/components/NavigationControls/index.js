// @flow
import React, {Component} from 'react';
import cx from 'classnames';
import Grid from '@material-ui/core/Grid';
import {ipcRenderer} from 'electron';
import HomeIcon from '../icons/Home';
import {Icon} from 'flwww';

import styles from './styles.module.css';
import commonStyles from '../common.styles.css';
import {iconsColor} from '../../constants/colors';
import {Tooltip} from '@material-ui/core';

class NavigationControls extends Component {
  componentDidMount() {
    ipcRenderer.on('reload-url', this.props.triggerNavigationReload);
    ipcRenderer.on('stop-loading-url',this.props.triggerStopLoading);
    ipcRenderer.on('reload-css', this.props.reloadCSS);
  }

  render() {
    const iconProps = {
      color: iconsColor,
      height: 25,
      width: 25,
    };
    const {backEnabled, forwardEnabled} = this.props;
    const pageLoading=this.props.devicesLoading && this.props.devicesLoading.size;

    let refreshOrCancel
    if(pageLoading){
      refreshOrCancel=
          <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
            <Tooltip title="Close">
              <div
                onClick={this.props.triggerStopLoading}
              >
                <Icon type="close" size="26px" {...iconProps} className="closeIcon" />
                {/*<ReloadIcon {...iconProps} height={15} width={15} padding={5} />*/}
              </div>
            </Tooltip>
          </Grid>
    }else{
      refreshOrCancel=
      <Grid item className={cx(commonStyles.icons, commonStyles.enabled)}>
            <Tooltip title="Reload">
              <div
                onClick={this.props.triggerNavigationReload}
                style={{transform: 'rotate(90deg)'}}
              >
                <Icon type="rotate" {...iconProps} className="reloadIcon" />
                {/*<ReloadIcon {...iconProps} height={15} width={15} padding={5} />*/}
              </div>
            </Tooltip>
          </Grid>
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
                {/*<ArrowRightIcon {...iconProps} />*/}
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
