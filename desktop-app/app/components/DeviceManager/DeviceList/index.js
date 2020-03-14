import React from 'react';
import {Droppable} from 'react-beautiful-dnd';
import DeviceItem from '../DeviceItem';
import cx from 'classnames';

import styles from './styles.css';

export default function DeviceList({droppableId, devices}) {
    return (
        <Droppable droppableId={droppableId}>
            {provided => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cx(styles.listHolder)}
                >
                    {devices.map((device, index) => (
                        <DeviceItem
                            device={device}
                            index={index}
                            key={device.id}
                        />
                    ))}
                </div>
            )}
        </Droppable>
    );
}
