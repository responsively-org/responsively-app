import React, {Component} from 'react';
import {setBrowserZoom} from '../../commons/utils';
import BrowserZoom from '../BrowserZoom';
import cx from 'classnames';

import styles from './style.module.css';

class Header extends Component {

  render() {
    return (
      <div className={cx(styles.container)}>
        <h1>Whater</h1>
        <BrowserZoom onChange={setBrowserZoom}/>
      </div>
    );
  }
}

export default Header;