// @flow
import React, {useState, useCallback} from 'react';
import cx from 'classnames';
import WebViewContainer from '../../containers/WebViewContainer';
import Spinner from '../Spinner';
import {CAPABILITIES} from '../../constants/devices';

import styles from './style.module.css';
import {getDeviceIcon} from '../../utils/iconUtils';
import KebabMenu from '../KebabMenu';
import {iconsColor} from '../../constants/colors';

function Renderer(props) {
  const {device, hidden, transmitNavigatorStatus} = props;
  const [loading, setLoading] = useState(true);
  const [isFlip, setFlip] = useState(false);
  const [finalDimensions, setFinalDimensions] = useState({
    width: device.width,
    height: device.height,
  });
  const dimension = [finalDimensions.width, 'x', finalDimensions.height];

  const sendFlipStatus = useCallback(
    status => {
      setFlip(status);
    },
    [isFlip]
  );

  const _muteDevice = () => {
    props.onDeviceMutedChange(props.device.id, true);
  };

  const _unmuteDevice = () => {
    props.onDeviceMutedChange(device.id, false);
  };

  return (
    <div className={cx(styles.container, {[styles.hidden]: hidden})}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          {getDeviceIcon(device.type)}
          <div className={styles.deviceInfo}>
            <span className={cx(styles.deviceTitle)}>{device.name}</span>
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
        </div>
        <KebabMenu>
          <div onClick={props.device.isMuted ? _unmuteDevice : _muteDevice}>
            {props.device.isMuted ? 'Unmute Audio' : 'Mute Audio'}
          </div>
        </KebabMenu>
      </div>
      <div className={cx(styles.deviceWrapper)}>
        <WebViewContainer
          device={device}
          sendFlipStatus={sendFlipStatus}
          transmitNavigatorStatus={transmitNavigatorStatus}
          onLoadingStateChange={setLoading}
          updateResponsiveDimensions={setFinalDimensions}
          muteDevice={_muteDevice}
          unmuteDevice={_unmuteDevice}
        />
      </div>
    </div>
  );
}

export default Renderer;
