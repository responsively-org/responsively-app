import React from 'react';
import cx from 'classnames';

import styles from './styles.module.css';

export default function UnDock({
  width,
  height,
  color,
  padding,
  margin,
  style,
  selected,
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="928 570.5 14 12"
      width={width}
      height={height}
      fill={color}
      style={{isolation: 'isolate', padding, margin, ...style}}
      className={cx(styles.chromeIcon, {[styles.selected]: selected})}
    >
      <defs>
        <clipPath id="_clipPath_r74TLLWuZiUzm0aGFcLYZf703TqDT1Pi">
          <rect x="928" y="570.5" width="14" height="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#_clipPath_r74TLLWuZiUzm0aGFcLYZf703TqDT1Pi)">
        <g>
          <path
            d=" M 930 573.5 L 928 573.5 L 928 582.5 L 939 582.5 L 939 580.5 L 930 580.5 L 930 573.5 Z "
            fill={color}
          />
          <path
            d=" M 933 572.5 L 940 572.5 L 940 577.5 L 933 577.5 L 933 572.5 Z  M 931 570.5 L 931 579.5 L 942 579.5 L 942 570.5 L 931 570.5 Z "
            fill={color}
          />
        </g>
      </g>
    </svg>
  );
}
