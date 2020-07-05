import React from 'react';
import cx from 'classnames';
import AndroidIcon from '@material-ui/icons/Android';
import DesktopIcon from '@material-ui/icons/DesktopWindows';
import MobileIcon from '@material-ui/icons/Smartphone';
import TabletIcon from '@material-ui/icons/TabletMac';
import {Icon} from 'flwww';
import WindowsIcon from '../icons/Windows';
import AppleIcon from '../icons/Apple';

import styles from './styles.css';
import commonStyles from '../common.styles.css';
import {iconsColor} from '../../constants/colors';
import {OS, DEVICE_TYPE} from '../../constants/devices';
import {FILTER_FIELDS} from '../../reducers/browser';

export default function QuickFilterDevices(props) {
  return (
    <div className={cx(commonStyles.sidebarContentSection)}>
      <div className={cx(commonStyles.sidebarContentSectionTitleBar)}>
        <Icon type="filter" color="white" size="30px" /> Quick Filters
      </div>
      <div className={cx(commonStyles.sidebarContentSectionContainer)}>
        <div className={cx(styles.filterSection)}>
          <div className={cx(styles.sectionTitle)}>Operating System</div>
          <div className={cx(styles.optionIconsContainer)}>
            <div
              className={cx(styles.optionIcon, commonStyles.icons, {
                [commonStyles.disabled]: false,
                [commonStyles.enabled]: true,
                [commonStyles.selected]:
                  props.browser.filters[FILTER_FIELDS.OS].indexOf(OS.ios) !==
                  -1,
              })}
              onClick={() => props.toggleFilter(FILTER_FIELDS.OS, OS.ios)}
            >
              <AppleIcon color={iconsColor} height={40} />
            </div>
            <div
              className={cx(styles.optionIcon, commonStyles.icons, {
                [commonStyles.disabled]: false,
                [commonStyles.enabled]: true,
                [commonStyles.selected]:
                  props.browser.filters[FILTER_FIELDS.OS].indexOf(
                    OS.android
                  ) !== -1,
              })}
              onClick={() => props.toggleFilter(FILTER_FIELDS.OS, OS.android)}
            >
              <AndroidIcon style={{fontSize: 40}} />
            </div>
            <div
              className={cx(styles.optionIcon, commonStyles.icons, {
                [commonStyles.disabled]: false,
                [commonStyles.enabled]: true,
                [commonStyles.selected]:
                  props.browser.filters[FILTER_FIELDS.OS].indexOf(
                    OS.windowsPhone
                  ) !== -1,
              })}
              onClick={() =>
                props.toggleFilter(FILTER_FIELDS.OS, OS.windowsPhone)
              }
            >
              <WindowsIcon color={iconsColor} height={34} padding={3} />
            </div>
            <div
              className={cx(styles.optionIcon, commonStyles.icons, {
                [commonStyles.disabled]: false,
                [commonStyles.enabled]: true,
                [commonStyles.selected]:
                  props.browser.filters[FILTER_FIELDS.OS].indexOf(OS.pc) !== -1,
              })}
              onClick={() => props.toggleFilter(FILTER_FIELDS.OS, OS.pc)}
            >
              <DesktopIcon style={{fontSize: 40}} />
            </div>
          </div>
        </div>
        <div className={cx(styles.filterSection)}>
          <div className={cx(styles.sectionTitle)}>Device</div>
          <div className={cx(styles.optionIconsContainer)}>
            <div
              className={cx(styles.optionIcon, commonStyles.icons, {
                [commonStyles.disabled]: false,
                [commonStyles.enabled]: true,
                [commonStyles.selected]:
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
              className={cx(styles.optionIcon, commonStyles.icons, {
                [commonStyles.disabled]: false,
                [commonStyles.enabled]: true,
                [commonStyles.selected]:
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
              className={cx(styles.optionIcon, commonStyles.icons, {
                [commonStyles.disabled]: false,
                [commonStyles.enabled]: true,
                [commonStyles.selected]:
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
