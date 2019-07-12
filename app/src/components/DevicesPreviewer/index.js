import React, {Component} from 'react';
import Renderer from '../Renderer';
import cx from 'classnames';

import styles from './style.module.css';

class DevicesPreviewer extends Component {

  render() {
    return (
      <div className={cx(styles.container)}>
        {this.props.devices.map(device => <Renderer key={device.id} device={device} src={this.props.url}></Renderer>)}
      </div>
    );
  }
}

export default DevicesPreviewer;