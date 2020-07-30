import React, {useState, useEffect} from 'react';
import cx from 'classnames';
import {shell, ipcRenderer} from 'electron';
import PropTypes from 'prop-types';
import Announcement from './Announcement';
import styles from './styles.module.css';
import Github from '../icons/Github';
import Twitter from '../icons/Twitter';
import RoadMap from '../icons/RoadMap';

const Spacer = ({width = 10}) => (
  <div className={cx(styles.text)} style={{width}} />
);

const AppUpdaterStatusInfoSection = () => {
  const [status, setAppUpdaterStatus] = useState('idle');
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
    default:
      label = null;
      break;
  }
  if (label == null) return null;
  return (
    <div className={styles.section}>
      <div>
        <span className={cx('appUpdaterStatusInfo', styles.linkText)}>
          {label}
        </span>
      </div>
    </div>
  );
};

const StatusBar = ({visible, zoomLevel}) => {
  if (!visible) {
    return null;
  }

  const zoomPercent = Math.round(zoomLevel * 100);

  return (
    <div className={styles.statusBar}>
      <div className={styles.section}>
        <div
          className={cx(styles.text, styles.link)}
          onClick={() =>
            shell.openExternal('https://github.com/manojVivek/responsively-app')
          }
        >
          <Github width={14} className={styles.linkIcon} />
        </div>
        <div
          className={cx(styles.text, styles.link)}
          onClick={() =>
            shell.openExternal(
              'https://twitter.com/intent/follow?original_referer=app&ref_src=twsrc%5Etfw&region=follow_link&screen_name=ResponsivelyApp&tw_p=followbutton'
            )
          }
        >
          <Twitter width={14} className={styles.linkIcon} />
        </div>
        <Spacer />
        <div
          className={cx('roadMapLink', styles.text, styles.link)}
          onClick={() =>
            shell.openExternal(
              'https://github.com/manojVivek/responsively-app/projects/12?fullscreen=true'
            )
          }
        >
          <RoadMap width={14} color="grey" className={styles.linkIcon} />
          <span className={cx('roadMapLink', styles.linkText)}>RoadMap</span>
        </div>
        <Spacer />
        <div
          className={cx(styles.text, styles.link)}
          onClick={() =>
            shell.openExternal('https://headwayapp.co/responsively-changelog')
          }
        >
          <span className={cx('changeLogLink', styles.linkText)}>
            Changelog
          </span>
        </div>
        <Spacer />
        <div className={cx(styles.text)}>
          <span className={cx('zoomText', styles.linkText)}>
            Zoom: {zoomPercent}%
          </span>
        </div>
      </div>
      <AppUpdaterStatusInfoSection />
      <div className={styles.section}>
        <Announcement />
      </div>
    </div>
  );
};

StatusBar.propTypes = {
  visible: PropTypes.bool.isRequired,
};

export default StatusBar;
