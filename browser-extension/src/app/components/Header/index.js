import React, {Component} from 'react';
import ZoomController from '../../containers/ZoomController';
import cx from 'classnames';

import styles from './style.module.css';

class Header extends Component {

  render() {
    return (
      <div className={cx(styles.container)}>
        <h1>Whater</h1>
        <ZoomController />
      </div>
    );
  }
}

export default Header;