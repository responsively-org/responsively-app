import React from 'react';
import Spinner from '../Spinner';
import Tick from '../icons/TickAnimation';

export default function NotificationMessage(props) {
    return (
        <div style={{display: 'flex'}}>
            {props.spinner && (
                <div style={{marginRight: 5}}>
                    <Spinner />
                </div>
            )}
            {props.tick && (
                <div style={{marginRight: 5}}>
                    <Tick />
                </div>
            )}
            {props.message}
        </div>
    );
}
