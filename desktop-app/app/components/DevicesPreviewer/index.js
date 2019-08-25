// @flow
import React, {Component} from 'react';
import Renderer from '../Renderer';
import cx from 'classnames';

import styles from './style.module.css';
import {
  HORIZONTAL_LAYOUT,
  FLEXIGRID_LAYOUT,
} from '../../constants/previewerLayouts';

class DevicesPreviewer extends Component {
  render() {
    const {
      browser: {
        devices,
        address,
        zoomLevel,
        previewer: {layout},
      },
    } = this.props;
    return (
      <div
        className={cx(styles.container, {
          [styles.flexigrid]: layout === FLEXIGRID_LAYOUT,
          [styles.horizontal]: layout === HORIZONTAL_LAYOUT,
        })}
      >
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
