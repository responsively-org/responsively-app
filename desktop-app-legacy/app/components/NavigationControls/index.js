import React, {Component} from 'react';
import cx from 'classnames';
import Grid from '@material-ui/core/Grid';
import {withStyles, withTheme} from '@material-ui/core/styles';
import {ipcRenderer} from 'electron';
import {Tooltip} from '@material-ui/core';
import HomeIcon from '../icons/Home';
import ArrowLeftIcon from '../icons/ArrowLeft';
import ArrowRightIcon from '../icons/ArrowRight';
import {styles as commonStyles} from '../useCommonStyles';
import Cross from '../icons/Cross';
import Reload from '../icons/Reload';
import {notifyPermissionToHandleReloadOrNewAddress} from '../../utils/permissionUtils.js';

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
    const {backEnabled, forwardEnabled, classes} = this.props;
    const deviceLoading = (this.props.devices || []).find(
      device => device.loading
    );

    let refreshOrCancel;
    if (deviceLoading) {
      refreshOrCancel = (
        <Grid item className={classes.icon}>
          <Tooltip title="Stop loading this page">
            <div
              className={classes.flexAlignVerticalMiddle}
              onClick={this.props.triggerStopLoading}
            >
              <Cross color="currentColor" padding={6} height={24} width={24} />
            </div>
          </Tooltip>
        </Grid>
      );
    } else {
      refreshOrCancel = (
        <Grid item className={classes.icon}>
          <Tooltip title="Reload">
            <div
              className={classes.flexAlignVerticalMiddle}
              onClick={() => {
                notifyPermissionToHandleReloadOrNewAddress();
                this.props.triggerNavigationReload();
              }}
            >
              <Reload color="currentColor" padding={4} height={24} width={24} />
            </div>
          </Tooltip>
        </Grid>
      );
    }

    return (
      <div className={classes.navigationControls}>
        <Grid container spacing={1} alignItems="center">
          <Grid
            item
            className={cx(classes.icon, {
              [classes.iconDisabled]: !backEnabled,
              [classes.iconHoverDisabled]: !backEnabled,
            })}
          >
            <div
              className={cx(classes.iconDisabler, {
                [classes.iconDisabled]: !backEnabled,
              })}
            />
            <Tooltip title="Back">
              <div
                className={classes.flexContainer}
                onClick={() => {
                  notifyPermissionToHandleReloadOrNewAddress();
                  this.props.triggerNavigationBack();
                }}
              >
                <ArrowLeftIcon
                  width={24}
                  height={24}
                  color={
                    backEnabled
                      ? 'currentColor'
                      : this.props.theme.palette.lightIcon.main
                  }
                />
              </div>
            </Tooltip>
          </Grid>
          <Grid
            item
            className={cx(classes.icon, {
              [classes.iconDisabled]: !forwardEnabled,
              [classes.iconHoverDisabled]: !forwardEnabled,
            })}
          >
            <div
              className={cx(classes.iconDisabler, {
                [classes.iconDisabled]: !forwardEnabled,
              })}
            />
            <Tooltip title="Forward">
              <div
                className={classes.flexContainer}
                onClick={() => {
                  notifyPermissionToHandleReloadOrNewAddress();
                  this.props.triggerNavigationForward();
                }}
              >
                <ArrowRightIcon
                  width={24}
                  height={24}
                  color={
                    forwardEnabled
                      ? 'currentColor'
                      : this.props.theme.palette.lightIcon.main
                  }
                />
              </div>
            </Tooltip>
          </Grid>

          {refreshOrCancel}

          <Grid item className={classes.icon}>
            <Tooltip title="Go to Homepage">
              <div
                className={classes.flexAlignVerticalMiddle}
                onClick={() => {
                  if (this.props.address !== this.props.homepage)
                    notifyPermissionToHandleReloadOrNewAddress();
                  this.props.goToHomepage();
                }}
              >
                <HomeIcon
                  color="currentColor"
                  height={25}
                  width={25}
                  padding={5}
                />
              </div>
            </Tooltip>
          </Grid>
        </Grid>
      </div>
    );
  }
}

const styles = theme => ({
  ...commonStyles(theme),
  navigationControls: {
    padding: '0 10px',
  },
});

export default withStyles(styles)(withTheme(NavigationControls));
