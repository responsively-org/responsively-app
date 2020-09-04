import React from 'react';
import cx from 'classnames';
import AndroidIcon from '@material-ui/icons/Android';
import DesktopIcon from '@material-ui/icons/DesktopWindows';
import MobileIcon from '@material-ui/icons/Smartphone';
import TabletIcon from '@material-ui/icons/TabletMac';
import {useTheme, makeStyles} from '@material-ui/core/styles';
import WindowsIcon from '../icons/Windows';
import AppleIcon from '../icons/Apple';
import FilterIcon from '../icons/Filter';
import useCommonStyles from '../useCommonStyles';
import {OS, DEVICE_TYPE} from '../../constants/devices';
import {FILTER_FIELDS} from '../../reducers/browser';

function QuickFilterDevices(props) {
  const theme = useTheme();
  const classes = useStyles();
  const commonClasses = useCommonStyles();

  return (
    <div className={commonClasses.sidebarContentSection}>
      <div className={commonClasses.sidebarContentSectionTitleBar}>
        <FilterIcon
          className={classes.filterIcon}
          width="20"
          height="20"
          color={theme.palette.text.primary}
        />
        Quick Filters
      </div>
      <div className={commonClasses.sidebarContentSectionContainer}>
        <div className={classes.filterSection}>
          <div className={classes.sectionTitle}>Operating System</div>
          <div className={classes.optionIconsContainer}>
            <div
              className={cx(classes.optionIcon, commonClasses.icon, {
                [commonClasses.iconSelected]:
                  props.browser.filters[FILTER_FIELDS.OS].indexOf(OS.ios) !==
                  -1,
              })}
              onClick={() => props.toggleFilter(FILTER_FIELDS.OS, OS.ios)}
            >
              <AppleIcon color="currentColor" height={40} />
            </div>
            <div
              className={cx(classes.optionIcon, commonClasses.icon, {
                [commonClasses.iconSelected]:
                  props.browser.filters[FILTER_FIELDS.OS].indexOf(
                    OS.android
                  ) !== -1,
              })}
              onClick={() => props.toggleFilter(FILTER_FIELDS.OS, OS.android)}
            >
              <AndroidIcon style={{fontSize: 40}} />
            </div>
            <div
              className={cx(classes.optionIcon, commonClasses.icon, {
                [commonClasses.iconSelected]:
                  props.browser.filters[FILTER_FIELDS.OS].indexOf(
                    OS.windowsPhone
                  ) !== -1,
              })}
              onClick={() =>
                props.toggleFilter(FILTER_FIELDS.OS, OS.windowsPhone)
              }
            >
              <WindowsIcon color="currentColor" height={34} padding={3} />
            </div>
            <div
              className={cx(classes.optionIcon, commonClasses.icon, {
                [commonClasses.iconSelected]:
                  props.browser.filters[FILTER_FIELDS.OS].indexOf(OS.pc) !== -1,
              })}
              onClick={() => props.toggleFilter(FILTER_FIELDS.OS, OS.pc)}
            >
              <DesktopIcon style={{fontSize: 40}} />
            </div>
          </div>
        </div>
        <div className={classes.filterSection}>
          <div className={classes.sectionTitle}>Device</div>
          <div className={classes.optionIconsContainer}>
            <div
              className={cx(classes.optionIcon, commonClasses.icon, {
                [commonClasses.iconSelected]:
                  props.browser.filters[FILTER_FIELDS.DEVICE_TYPE].indexOf(
                    DEVICE_TYPE.phone
                  ) !== -1,
              })}
              onClick={() =>
                props.toggleFilter(FILTER_FIELDS.DEVICE_TYPE, DEVICE_TYPE.phone)
              }
            >
              <MobileIcon style={{fontSize: 35}} />
            </div>
            <div
              className={cx(classes.optionIcon, commonClasses.icon, {
                [commonClasses.iconSelected]:
                  props.browser.filters[FILTER_FIELDS.DEVICE_TYPE].indexOf(
                    DEVICE_TYPE.tablet
                  ) !== -1,
              })}
              onClick={() =>
                props.toggleFilter(
                  FILTER_FIELDS.DEVICE_TYPE,
                  DEVICE_TYPE.tablet
                )
              }
            >
              <TabletIcon style={{fontSize: 35}} />
            </div>
            <div
              className={cx(classes.optionIcon, commonClasses.icon, {
                [commonClasses.iconSelected]:
                  props.browser.filters[FILTER_FIELDS.DEVICE_TYPE].indexOf(
                    DEVICE_TYPE.desktop
                  ) !== -1,
              })}
              onClick={() =>
                props.toggleFilter(
                  FILTER_FIELDS.DEVICE_TYPE,
                  DEVICE_TYPE.desktop
                )
              }
            >
              <DesktopIcon style={{fontSize: 40}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const useStyles = makeStyles(theme => ({
  filterSection: {
    marginBottom: '10px',
  },
  filterIcon: {
    marginRight: '5px',
  },
  sectionTitle: {
    margin: '5px',
  },
  optionIconsContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  optionIcon: {
    display: 'flex',
    width: '40px',
    height: '40px',
    marginRight: '5px',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.palette.mode({
      light: {},
      dark: {background: '#000000b0'},
    }),
    '& svg': {
      padding: '5px',
    },
  },
}));

export default QuickFilterDevices;
