import React from 'react';

import styles from './styles.module.css';

export default function DockBottom({width, height, color, padding, margin}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 14.14 12"
      width={width}
      height={height}
      fill={color}
      style={{padding, margin}}
      className={styles.chromeIcon}
    >
      <defs>
        <clipPath id="_clipPath_oN17WILa5750lHQzygNFwNgKorN1U9tL">
          <rect width="14.14" height="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#_clipPath_oN17WILa5750lHQzygNFwNgKorN1U9tL)">
        <path
          d=" M 0 0 L 14.14 0 L 14.14 12 L 0 12 L 0 0 Z  M 2.07 2.052 L 12.07 2.052 L 12.07 7.052 L 2.07 7.052 L 2.07 2.052 Z "
          fillRule="evenodd"
          fill={color}
        />
      </g>
    </svg>
  );
}
