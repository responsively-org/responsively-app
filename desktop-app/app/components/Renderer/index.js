// @flow
import React, {useState} from 'react';
import WebViewContainer from '../../containers/WebViewContainer';
import cx from 'classnames';
import Spinner from '../Spinner';
import TickAnimation from '../icons/TickAnimation';

import styles from './style.module.css';

function Renderer(props) {
  const [loading, setLoading] = useState(true);
  return (
    <div className={cx(styles.container)}>
      <div className={styles.titleContainer}>
        <h3 className={cx(styles.deviceTitle)}>{props.device.name}</h3>
        {loading && <Spinner size={18} />}
      </div>
      <div className={cx(styles.deviceWrapper)}>
        <WebViewContainer
          device={props.device}
          transmitNavigatorStatus={props.transmitNavigatorStatus}
          onLoadingStateChange={setLoading}
        />
      </div>
    </div>
  );
}

export default Renderer;
