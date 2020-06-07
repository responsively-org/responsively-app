import React from 'react';

import styles from './styles.module.css';

export default function DockBottom({width, height, color, padding, margin}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      style={{isolation: 'isolate'}}
      viewBox="0 0 14.14 12"
      width={width}
      height={height}
      fill={color}
      style={{padding, margin}}
      className={styles.chromeIcon}
    >
      <defs>
        <clipPath id="_clipPath_K7J0VnL39Cs1RDRy3hjLgKHHcmSs1prC">
          <rect width="14.14" height={height} />
        </clipPath>
      </defs>
      <g clipPath="url(#_clipPath_K7J0VnL39Cs1RDRy3hjLgKHHcmSs1prC)">
        <path
          d=" M 0 0 L 14.14 0 L 14.14 12 L 0 12 L 0 0 Z  M 2.221 2 L 12.221 2 L 12.221 7 L 2.221 7 L 2.221 2 Z "
          fillRule="evenodd"
          fill={color}
        />
      </g>
    </svg>
  );
}
