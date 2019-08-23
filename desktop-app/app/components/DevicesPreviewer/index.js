// @flow
import React, {Component} from 'react';
import Renderer from '../Renderer';
import cx from 'classnames';

import styles from './style.module.css';

class DevicesPreviewer extends Component {
  render() {
    console.log('DevicesPreviewer  props', this.props);
    const {
      browser: {devices, address, zoomLevel},
    } = this.props;
    return (
      <div className={cx(styles.container)}>
        {devices.map((device, index) => (
          <Renderer
            key={device.id}
            device={device}
            src={address}
            zoomLevel={zoomLevel}
            transmitNavigatorStatus={index === 0}
          />
        ))}
      </div>
    );
  }
}

export default DevicesPreviewer;
