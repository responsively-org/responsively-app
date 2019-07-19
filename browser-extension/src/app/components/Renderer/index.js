import React, {Component} from 'react';
import cx from 'classnames';

import styles from './style.module.css';

class Renderer extends Component {

  render() {
    return (
      <div className={cx(styles.container)}>
        <h2>{this.props.device.name}</h2>
        <iframe title={this.props.device.name} src={this.props.src} width={this.props.device.width} height={this.props.device.height}/>
      </div>
    );
  }
}

export default Renderer;