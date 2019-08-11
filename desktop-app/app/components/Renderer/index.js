// @flow
import React, {Component} from 'react';
import cx from 'classnames';

import styles from './style.module.css';

class Renderer extends Component {
  render() {
    console.log('Renderer this.props', this.props);
    return (
      <div className={cx(styles.container)}>
        <h2>{this.props.device.name}</h2>
        <div
          className={cx(styles.deviceWrapper)}
          style={{
            width: this.props.device.width * this.props.zoomLevel,
            heigth: this.props.device.height * this.props.zoomLevel,
          }}
        >
          <webview
            className={cx(styles.device)}
            title={this.props.device.name}
            src={this.props.src}
            width={this.props.device.width}
            height={this.props.device.height}
            style={{
              width: this.props.device.width,
              height: this.props.device.height,
              transform: `scale(${this.props.zoomLevel})`,
            }}
          />
        </div>
      </div>
    );
  }
}

export default Renderer;
