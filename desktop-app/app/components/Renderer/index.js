// @flow
import React, {Component} from 'react';
import WebView from '../WebView';
import cx from 'classnames';

import styles from './style.module.css';

class Renderer extends Component {
  render() {
    console.log('Renderer this.props', this.props);
    return (
      <div className={cx(styles.container)}>
        <h3>{this.props.device.name}</h3>
        <div
          className={cx(styles.deviceWrapper)}
          style={{
            width: this.props.device.width * this.props.zoomLevel,
            heigth: this.props.device.height * this.props.zoomLevel,
          }}
        >
          <WebView
            src={this.props.src}
            width={this.props.device.width}
            height={this.props.device.height}
            zoomLevel={this.props.zoomLevel}
          />
        </div>
      </div>
    );
  }
}

export default Renderer;
