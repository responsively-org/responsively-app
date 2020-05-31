import React, {useState} from 'react';
import {Draggable} from 'react-beautiful-dnd';
import DragIndicator from '@material-ui/icons/DragIndicator';
import PhoneIcon from '@material-ui/icons/PhoneIphone';
import IconButton from '@material-ui/core/IconButton';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Tooltip from '@material-ui/core/Tooltip';
import cx from 'classnames';

import styles from './styles.css';
import commonStyles from '../../common.styles.css';
import {DEVICE_TYPE, SOURCE} from '../../../constants/devices';
import {getDeviceIcon, getOSIcon} from '../../../utils/iconUtils';

export default function DeviceItem({
  device,
  index,
  enableCustomDeviceDeletion,
  deleteDevice,
}) {
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);
  return (
    <Draggable draggableId={device.id} index={index}>
      {provided => (
        <div
          className={cx(styles.deviceHolder)}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onMouseEnter={() => setShowDeleteIcon(true)}
          onMouseLeave={() => setShowDeleteIcon(false)}
        >
          <div
            className={cx(
              commonStyles.flexAlignVerticalMiddle,
              commonStyles.fullWidth,
              styles.content
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
            {enableCustomDeviceDeletion &&
            device.source === SOURCE.custom &&
            showDeleteIcon ? (
              <Tooltip title="Delete Device Profile">
                <IconButton
                  className={styles.deleteIcon}
                  onClick={() => deleteDevice(device)}
                >
                  <DeleteForeverIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </div>
        </div>
      )}
    </Draggable>
  );
}
