// @flow
import React, {useState, useCallback} from 'react';
import WebViewContainer from '../../containers/WebViewContainer';
import cx from 'classnames';
import Spinner from '../Spinner';
import TickAnimation from '../icons/TickAnimation';

import styles from './style.module.css';
import {getDeviceIcon} from '../../utils/iconUtils';

function Renderer(props) {
  const [loading, setLoading] = useState(true);
  const [isFlip, setFlip] = useState(false);
  let dimension = [props.device.width, 'x', props.device.height];

  const sendFlipStatus = useCallback(
    status => {
      setFlip(status);
    },
    [isFlip]
  );

  return (
    <div className={cx(styles.container, {[styles.hidden]: props.hidden})}>
      <div className={styles.titleContainer}>
        {getDeviceIcon(props.device.type)}
        <span className={cx(styles.deviceTitle)}>{props.device.name}</span>
        <div className={cx(styles.deviceSize)}>
          {isFlip ? dimension.reverse().join('') : dimension.join('')}
        </div>
        <div className={cx(styles.loaderContainer)}>
          {loading && (
            <div>
              <Spinner size={16} />
            </div>
          )}
        </div>
      </div>
      <div className={cx(styles.deviceWrapper)}>
        <WebViewContainer
          device={props.device}
          sendFlipStatus={sendFlipStatus}
          transmitNavigatorStatus={props.transmitNavigatorStatus}
          onLoadingStateChange={setLoading}
          devToolBottomRef={props.devToolBottomRef}
        />
      </div>
    </div>
  );
}

export default Renderer;
