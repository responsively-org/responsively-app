import React, {Fragment} from 'react';
import styles from './styles.css';

export default ({width, height, color = '#ffffff80', padding}) => (
    <Fragment>
        <svg
            height={height}
            width={width}
            fill={color}
            className={styles.iconCheck}
            viewBox="0 0 225 225"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            xmlSpace="preserve"
        >
            <g transform="matrix(1,0,0,1,-178.667,-170.667)">
                <g className={styles.check} transform="matrix(1,0,0,1,176,113)">
                    <path
                        d="M65,166L101,202L165,138"
                        style={{
                            fill: 'none',
                            stroke: color,
                            strokeWidth: 16.67,
                        }}
                    />
                </g>
                <circle
                    className={styles.circle}
                    cx="291"
                    cy="283"
                    r="104"
                    style={{stroke: color}}
                />
            </g>
        </svg>
    </Fragment>
);
