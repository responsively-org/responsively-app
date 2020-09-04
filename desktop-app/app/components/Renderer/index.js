import React, {useState, useCallback} from 'react';
import cx from 'classnames';
import {makeStyles} from '@material-ui/core/styles';
import WebViewContainer from '../../containers/WebViewContainer';
import Spinner from '../Spinner';
import {CAPABILITIES} from '../../constants/devices';
import useCommonStyles from '../useCommonStyles';
import {getDeviceIcon} from '../../utils/iconUtils';
import KebabMenu from '../KebabMenu';

function Renderer(props) {
  const {device, hidden, transmitNavigatorStatus} = props;
  const [loading, setLoading] = useState(true);
  const [isFlip, setFlip] = useState(false);
  const classes = useStyles();
  const commonClasses = useCommonStyles();
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
    <div className={cx(classes.container, {[commonClasses.hidden]: hidden})}>
      <div
        className={cx(commonClasses.flexAlignVerticalMiddle, classes.header)}
      >
        <div
          className={cx(
            commonClasses.flexAlignVerticalMiddle,
            classes.titleContainer
          )}
        >
          {getDeviceIcon(device.type)}
          <div className={classes.deviceInfo}>
            <span className={classes.deviceTitle}>{device.name}</span>
            <div className={classes.deviceSize}>
              {isFlip ? dimension.reverse().join('') : dimension.join('')}
            </div>
            <div className={classes.loaderContainer}>
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
      <div>
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

const useStyles = makeStyles(theme => ({
  container: {
    margin: '10px',
  },
  header: {
    justifyContent: 'space-between',
  },
  titleContainer: {
    margin: '3px',
  },
  deviceInfo: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  deviceTitle: {
    fontSize: '16px',
    fontWeight: 'normal',
    margin: '0 6px -2px 4px',
  },
  deviceSize: {
    fontSize: '9px',
    display: 'flex',
    height: '15px',
    alignItems: 'flex-end',
    color: theme.palette.mode({
      light: theme.palette.grey[600],
      dark: 'lightgrey',
    }),
    marginRight: '5px',
  },
  loaderContainer: {
    width: '20px',
  },
}));

export default Renderer;
