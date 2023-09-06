// @flow
import React, {Component, useEffect, useRef, useState} from 'react';
import cx from 'classnames';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import ScrollDownIcon from '../icons/ScrollDown';
import ScrollUpIcon from '../icons/ScrollUp';
import Unplug from '../icons/Unplug';
import ScreenshotIcon from '../icons/FullScreenshot';
import DeviceRotateIcon from '../icons/DeviceRotate';
import InspectElementIcon from '../icons/InspectElement';
import DesignModeIcon from '../icons/DesignMode';
import MutedIcon from '../icons/Muted';
import UnmutedIcon from '../icons/Unmuted';
import useCommonStyles from '../useCommonStyles';
import ZoomContainer from '../../containers/ZoomContainer';
import PrefersColorSchemeSwitch from '../PrefersColorSchemeSwitch';
import ToggleTouch from '../ToggleTouch';
import Muted from '../icons/Muted';
import CSSEditor from '../icons/CSSEditor';
import styles from '../WebView/style.module.css';
import PageNavigatorIcon from '../icons/PageNavigator';

const useStyles = makeStyles({
  container: {
    padding: '0 10px',
  },
});

const useRulerStyles = makeStyles(theme => ({
  ruler: {borderRight: `1px solid ${theme.palette.text.inactive}`, height: 20},
}));

const VerticalRuler = () => {
  const styles = useRulerStyles();

  return <div className={styles.ruler} />;
};

const ScrollControls = ({
  toggleEventMirroringAllDevices,
  browser,
  triggerScrollDown,
  triggerScrollUp,
  screenshotAllDevices,
  flipOrientationAllDevices,
  toggleInspector,
  toggleCSSEditor,
  onAllDevicesMutedChange,
  onToggleAllDeviceDesignMode,
  onChangePageNavigatorActive,
}) => {
  const [eventMirroring, setEventMirroring] = useState(true);
  const initialRender = useRef(true);
  const classes = useStyles();
  const theme = useTheme();
  const commonClasses = useCommonStyles();
  const iconProps = {
    color: 'currentColor',
    height: 25,
    width: 25,
  };

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      toggleEventMirroringAllDevices(eventMirroring);
    }
  }, [eventMirroring]);

  const handleEventMirroring = () => {
    setEventMirroring(!eventMirroring);
  };

  return (
    <div className={classes.container}>
      <Grid container spacing={1} alignItems="center">
        <Grid
          item
          className={cx(commonClasses.icon, {
            [commonClasses.iconSelected]: browser.CSSEditor.isOpen,
          })}
          onClick={toggleCSSEditor}
        >
          <Tooltip title="Live CSS Editor">
            <div>
              <CSSEditor {...iconProps} />
            </div>
          </Tooltip>
        </Grid>
        <Grid
          item
          className={cx(commonClasses.icon, {
            [commonClasses.iconSelected]: browser.isInspecting,
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
        <Grid
          item
          className={cx(commonClasses.icon, {
            [commonClasses.iconSelected]: browser.allDevicesInDesignMode,
          })}
        >
          <Tooltip
            title={
              browser.allDevicesInDesignMode
                ? 'Disable Design Mode on all devices'
                : 'Enable Design Mode on all devices'
            }
          >
            <div onClick={onToggleAllDeviceDesignMode}>
              <DesignModeIcon {...{...iconProps, ...{height: 22, width: 22}}} />
            </div>
          </Tooltip>
        </Grid>
        <Grid
          item
          className={cx(commonClasses.icon, {
            [commonClasses.iconSelected]: browser.pageNavigator.active,
          })}
        >
          <Tooltip title="Page Navigator">
            <div
              onClick={() => {
                onChangePageNavigatorActive(!browser.pageNavigator.active);
              }}
            >
              <PageNavigatorIcon {...iconProps} height={22} width={22} />
            </div>
          </Tooltip>
        </Grid>
        <Grid item>
          <VerticalRuler />
        </Grid>
        <Grid item className={commonClasses.icon}>
          <PrefersColorSchemeSwitch iconProps={iconProps} />
        </Grid>
        <ToggleTouch iconProps={iconProps} />
        <Grid item className={commonClasses.icon}>
          <Tooltip
            title={
              browser.allDevicesMuted
                ? 'Unmute all devices'
                : 'Mute all devices'
            }
          >
            <div onClick={onAllDevicesMutedChange}>
              {browser.allDevicesMuted ? (
                <MutedIcon {...iconProps} />
              ) : (
                <UnmutedIcon {...iconProps} />
              )}
            </div>
          </Tooltip>
        </Grid>
        <Grid item className={commonClasses.icon}>
          <Tooltip title="Tilt Devices">
            <div onClick={flipOrientationAllDevices}>
              <DeviceRotateIcon {...iconProps} />
            </div>
          </Tooltip>
        </Grid>
        <Grid item>
          <VerticalRuler />
        </Grid>
        <Grid item className={commonClasses.icon}>
          <Tooltip title="Take Screenshot">
            <div onClick={screenshotAllDevices}>
              <ScreenshotIcon {...iconProps} />
            </div>
          </Tooltip>
        </Grid>
        <Grid
          item
          className={cx(commonClasses.icon, {
            [commonClasses.iconSelected]: !eventMirroring,
          })}
        >
          <Tooltip title="Disable event mirroring">
            <div onClick={handleEventMirroring}>
              <Unplug {...iconProps} />
            </div>
          </Tooltip>
        </Grid>

        <ZoomContainer iconProps={iconProps} />
      </Grid>
    </div>
  );
};

export default ScrollControls;
