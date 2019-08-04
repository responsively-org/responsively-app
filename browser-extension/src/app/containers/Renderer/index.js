import React, {Component} from 'react';
import {connect} from 'react-redux';
import cx from 'classnames';

import styles from './style.module.css';

class Renderer extends Component {

  render() {

    console.log('this.props.zoomLevel', this.props.zoomLevel);
    return (
      <div className={cx(styles.container)}>
        <h2>{this.props.device.name}</h2>
        <div className={cx(styles.deviceWrapper)} style={{width: this.props.device.width * this.props.zoomLevel, heigth: this.props.device.height * this.props.zoomLevel}}>
        <iframe className={cx(styles.device)} title={this.props.device.name} src={this.props.src} width={this.props.device.width} height={this.props.device.height} style={{transform: `scale(${this.props.zoomLevel})`}}/>
        </div>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  zoomLevel: state.preview.zoom,
});

export default connect(
  mapStateToProps,
  {}
)(Renderer);