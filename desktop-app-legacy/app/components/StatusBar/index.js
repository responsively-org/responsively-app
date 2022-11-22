import React, {useState, useEffect} from 'react';
import cx from 'classnames';
import {shell, ipcRenderer} from 'electron';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import useStyles from './useStyles';
import Announcement from './Announcement';
import Github from '../icons/Github';
import Twitter from '../icons/Twitter';
import RoadMap from '../icons/RoadMap';

const Spacer = ({width = 10}) => {
  const classes = useStyles();
  return <div className={classes.text} style={{width}} />;
};

const AppUpdaterStatusInfoSection = () => {
  const [status, setAppUpdaterStatus] = useState('idle');
  const classes = useStyles();
  useEffect(() => {
    const handler = (event, args) => {
      setAppUpdaterStatus(args.nextStatus);
    };
    ipcRenderer.on('updater-status-changed', handler);
    return () => {
      ipcRenderer.removeListener('updater-status-changed', handler);
    };
  }, []);

  let label = '';
  switch (status) {
    case 'checking':
      label = 'Update Info: Checking for Updates...';
      break;
    case 'noUpdate':
      label = 'Update Info: The App is up to date!';
      break;
    case 'downloading':
      label = 'Update Info: Downloading Update...';
      break;
    case 'downloaded':
      label = 'Update Info: Update Downloaded';
      break;
    case 'newVersion':
      label = 'Update Info: New version available!';
      break;
    default:
      label = null;
      break;
  }
  if (label == null) return null;
  return (
    <div className={classes.section}>
      <div>
        <span className={cx('appUpdaterStatusInfo', classes.linkText)}>
          {label}
        </span>
      </div>
    </div>
  );
};

const StatusBar = ({visible, zoomLevel}) => {
  const classes = useStyles();
  if (!visible) {
    return null;
  }

  const zoomPercent = Math.round(zoomLevel * 100);

  return (
    <Paper elevation={0} className={classes.statusBar}>
      <div className={classes.section}>
        <div
          className={cx(classes.text, classes.link)}
          onClick={() =>
            shell.openExternal(
              'https://github.com/responsively-org/responsively-app'
            )
          }
        >
          <Github width={14} className={classes.linkIcon} />
        </div>
        <div
          className={cx(classes.text, classes.link)}
          onClick={() =>
            shell.openExternal(
              'https://twitter.com/intent/follow?original_referer=app&ref_src=twsrc%5Etfw&region=follow_link&screen_name=ResponsivelyApp&tw_p=followbutton'
            )
          }
        >
          <Twitter width={14} className={classes.linkIcon} />
        </div>
        <Spacer />
        <div
          className={cx('roadMapLink', classes.text, classes.link)}
          onClick={() =>
            shell.openExternal(
              'https://github.com/responsively-org/responsively-app/projects/12?fullscreen=true'
            )
          }
        >
          <RoadMap width={14} color="grey" className={classes.linkIcon} />
          <span className={cx('roadMapLink', classes.linkText)}>RoadMap</span>
        </div>
        <Spacer />
        <div
          className={cx(classes.text, classes.link)}
          onClick={() =>
            shell.openExternal('https://headwayapp.co/responsively-changelog')
          }
        >
          <span className={cx('changeLogLink', classes.linkText)}>
            Changelog
          </span>
        </div>
        <Spacer />
        <div className={classes.text}>
          <span className={cx('zoomText', classes.linkText)}>
            Zoom: {zoomPercent}%
          </span>
        </div>
      </div>
      <AppUpdaterStatusInfoSection />
      <div className={classes.section}>
        <Announcement />
      </div>
    </Paper>
  );
};

StatusBar.propTypes = {
  visible: PropTypes.bool.isRequired,
};

export default StatusBar;
