import React from 'react';
import cx from 'classnames';
import {useTheme} from '@material-ui/core/styles';
import DeviceManagerContainer from '../../containers/DeviceManagerContainer';
import DevicesIcon from '../icons/Devices';
import useCommonStyles from '../useCommonStyles';

function DevicesOverview(props) {
  const theme = useTheme();
  const commonClasses = useCommonStyles();

  return (
    <div className={commonClasses.sidebarContentSection}>
      <div className={commonClasses.sidebarContentSectionTitleBar}>
        <DevicesIcon color={theme.palette.text.primary} width={26} margin={2} />{' '}
        Devices
      </div>
      <div className={commonClasses.sidebarContentSectionContainer}>
        <div
          className={cx(
            commonClasses.flexContainer,
            commonClasses.flexContainerSpaceBetween
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

export default DevicesOverview;
