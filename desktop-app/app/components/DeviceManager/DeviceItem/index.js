import React from 'react';
import {Draggable} from 'react-beautiful-dnd';
import DragIndicator from '@material-ui/icons/DragIndicator';
import PhoneIcon from '@material-ui/icons/PhoneIphone';
import cx from 'classnames';

import styles from './styles.css';
import commonStyles from '../../common.styles.css';
import {DEVICE_TYPE} from '../../../constants/devices';
import {getDeviceIcon, getOSIcon} from '../../../utils/iconUtils';

export default function DeviceItem({device, index}) {
  return (
    <Draggable draggableId={device.id} index={index}>
      {provided => (
        <div
          className={cx(styles.deviceHolder)}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div
            className={cx(
              commonStyles.flexAlignVerticalMiddle,
              commonStyles.fullWidth
            )}
          >
            <DragIndicator style={{color: 'grey'}} />
            <div
              className={cx(
                commonStyles.flexContainerSpaceBetween,
                commonStyles.fullWidth
              )}
            >
              <div className={commonStyles.flexAlignVerticalMiddle}>
                {getDeviceIcon(device.type)}
                <span className={styles.deviceName}>{device.name}</span>
                <span className={styles.deviceDimensions}>
                  {device.width}x{device.height}
                </span>
              </div>
              <div>{getOSIcon(device.os, '#ffffff90')}</div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
