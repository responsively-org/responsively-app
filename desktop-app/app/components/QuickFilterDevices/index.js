import React from 'react';
import cx from 'classnames';
import AppleIcon from '../icons/Apple';
import WindowsIcon from '../icons/Windows';
import AndroidIcon from '@material-ui/icons/Android';
import DesktopIcon from '@material-ui/icons/DesktopWindows';

import styles from './styles.css';
import commonStyles from '../common.styles.css';
import {iconsColor} from '../../constants/colors';
import {OS} from '../../constants/devices';
import {FILTER_FIELDS} from '../../reducers/browser';

export default function QuickFilterDevices(props) {
  return (
    <div>
      <div>Quick Filters</div>
      <div>
        <div>OS:</div>
        <div className={cx(styles.osIconsContainer)}>
          <div
            className={cx(styles.osIcon, commonStyles.icons, {
              [commonStyles.disabled]: false,
              [commonStyles.enabled]: true,
              [commonStyles.selected]:
                props.browser.filters[FILTER_FIELDS.OS].indexOf(OS.ios) !== -1,
            })}
            onClick={() => props.toggleFilter(FILTER_FIELDS.OS, OS.ios)}
          >
            <AppleIcon color={iconsColor} height={40} />
          </div>
          <div
            className={cx(styles.osIcon, commonStyles.icons, {
              [commonStyles.disabled]: false,
              [commonStyles.enabled]: true,
              [commonStyles.selected]:
                props.browser.filters[FILTER_FIELDS.OS].indexOf(OS.android) !==
                -1,
            })}
            onClick={() => props.toggleFilter(FILTER_FIELDS.OS, OS.android)}
          >
            <AndroidIcon color={iconsColor} style={{fontSize: 40}} />
          </div>
          <div
            className={cx(styles.osIcon, commonStyles.icons, {
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
            className={cx(styles.osIcon, commonStyles.icons, {
              [commonStyles.disabled]: false,
              [commonStyles.enabled]: true,
              [commonStyles.selected]:
                props.browser.filters[FILTER_FIELDS.OS].indexOf(OS.pc) !== -1,
            })}
            onClick={() => props.toggleFilter(FILTER_FIELDS.OS, OS.pc)}
          >
            <DesktopIcon color={iconsColor} style={{fontSize: 40}} />
          </div>
        </div>
      </div>
    </div>
  );
}
