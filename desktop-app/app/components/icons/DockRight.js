import React from 'react';

import styles from './styles.module.css';

export default function DockRight({width, height, color, padding, margin}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="971 549.189 26.921 23.075"
      width={width}
      height={height}
      fill={color}
      style={{padding, margin}}
      className={styles.chromeIcon}
    >
      <defs>
        <clipPath id="_clipPath_2OGwdnVsHCmr21dCKCMnSfgqfcYXnpYG">
          <rect x="971" y="549.189" width="26.921" height="23.075" />
        </clipPath>
      </defs>
      <g clipPath="url(#_clipPath_2OGwdnVsHCmr21dCKCMnSfgqfcYXnpYG)">
        <path
          d=" M 971 549.189 L 997.921 549.189 L 997.921 572.264 L 971 572.264 L 971 549.189 Z  M 974.395 552.727 L 988.395 552.727 L 988.395 568.727 L 974.395 568.727 L 974.395 552.727 Z "
          fillRule="evenodd"
          fill={color}
        />
      </g>
    </svg>
  );
}
