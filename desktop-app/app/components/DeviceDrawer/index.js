import React from 'react';
import PreviewerLayoutSelector from '../PreviewerLayoutSelector';
import DeviceManagerContainer from '../../containers/DeviceManagerContainer';
import QuickFilterDevicesContainer from '../../containers/QuickFilterDevicesContainer';
import Divider from '@material-ui/core/Divider';

import styles from './styles.css';

export default function DeviceDrawer(props) {
  return (
    <div className={styles.container}>
      <div className={styles.label}>
        Edit Devices List <DeviceManagerContainer />
      </div>
      <Divider variant="middle" />
      <div className={styles.label}>Layout:</div>
      <PreviewerLayoutSelector
        value={props.browser.previewer.layout}
        onChange={val => props.setPreviewLayout(val.value)}
      />
      <Divider />
      <QuickFilterDevicesContainer />
    </div>
  );
}
