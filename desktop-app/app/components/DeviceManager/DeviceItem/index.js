import React from 'react';
import {Draggable} from 'react-beautiful-dnd';
import DragIndicator from '@material-ui/icons/DragIndicator';
import PhoneIcon from '@material-ui/icons/PhoneIphone';
import cx from 'classnames';

import styles from './styles.css';

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
          <DragIndicator />
          <div>
            <PhoneIcon />
            <span className={styles.deviceName}>{device.name}</span>
            <span className={styles.deviceDimensions}>
              {device.width}x{device.height}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
