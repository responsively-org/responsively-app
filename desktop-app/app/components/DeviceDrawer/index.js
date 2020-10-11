import React from 'react';
import cx from 'classnames';
import Divider from '@material-ui/core/Divider';
import PreviewerLayoutSelector from '../PreviewerLayoutSelector';
import DeviceManagerContainer from '../../containers/DeviceManagerContainer';
import QuickFilterDevicesContainer from '../../containers/QuickFilterDevicesContainer';
import DevicesIcon from '../icons/Devices';
import DevicesOverviewContainer from '../../containers/DevicesOverviewContainer';
import styles from './styles.css';

export default function DeviceDrawer({
  browser: {
    previewer: {layout},
  },
  setPreviewLayout,
}) {
  return (
    <div>
      <DevicesOverviewContainer />
      <PreviewerLayoutSelector
        value={layout}
        onChange={val => setPreviewLayout(val.value)}
      />
      <QuickFilterDevicesContainer />
    </div>
  );
}
