// @flow
import React, {Component} from 'react';
import WebViewContainer from '../../containers/WebViewContainer';
import cx from 'classnames';

import styles from './style.module.css';

class Renderer extends Component {
  render() {
    console.log('Renderer this.props', this.props);
    return (
      <div className={cx(styles.container)}>
        <h3 className={cx(styles.deviceTitle)}>{this.props.device.name}</h3>
        <div
          className={cx(styles.deviceWrapper)}
          style={{
            width: this.props.device.width * this.props.zoomLevel,
            heigth: this.props.device.height * this.props.zoomLevel,
          }}
        >
          <WebViewContainer device={this.props.device} />
        </div>
      </div>
    );
  }
}

export default Renderer;
