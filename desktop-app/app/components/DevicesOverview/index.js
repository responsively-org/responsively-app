import React from 'react';
import cx from 'classnames';
import DeviceManagerContainer from '../../containers/DeviceManagerContainer';
import DevicesIcon from '../icons/Devices';

import commonStyles from '../common.styles.css';

export default function DevicesOverview(props) {
  return (
    <div className={cx(commonStyles.sidebarContentSection)}>
      <div className={cx(commonStyles.sidebarContentSectionTitleBar)}>
        <DevicesIcon color="white" width={26} margin={2} /> Devices
      </div>
      <div className={cx(commonStyles.sidebarContentSectionContainer)}>
        <div
          className={cx(
            commonStyles.flexContainer,
            commonStyles.flexContainerSpaceBetween
          )}
        >
          {props.browser.devices.length} active device
          {props.browser.devices.length !== 1 && 's'}
          <DeviceManagerContainer />
        </div>
      </div>
    </div>
  );
}
