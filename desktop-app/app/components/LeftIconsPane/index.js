// @flow
import React from 'react';
import Logo from '../icons/Logo';
import cx from 'classnames';

import styles from './styles.css';

const LeftIconsPane = () => (
  <div className={styles.iconsContainer}>
    <div className={cx(styles.icon, styles.logo)}>
      <Logo width={50} height={50} />
    </div>
  </div>
);

export default LeftIconsPane;
