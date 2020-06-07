import React from 'react';

import styles from './styles.module.css';

export default function InspectElementChrome({
  width,
  height,
  color,
  padding,
  margin,
  style,
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="1037.909 556.137 16 16"
      width={width}
      height={height}
      fill={color}
      style={{isolation: 'isolate', padding, margin, ...style}}
      className={styles.chromeIcon}
    >
      <defs>
        <clipPath id="_clipPath_NlBZVvucrUfAyfaqZqVDKpIaZEkvYgwZ">
          <rect x="1037.909" y="556.137" width="16" height="16" />
        </clipPath>
      </defs>
      <g clipPath="url(#_clipPath_NlBZVvucrUfAyfaqZqVDKpIaZEkvYgwZ)">
        <g>
          <g opacity="0.5">
            <path
              d=" M 1037.909 556.137 L 1053.909 556.137 L 1053.909 572.137 L 1037.909 572.137 L 1037.909 556.137 Z "
              fill="none"
            />
          </g>
          <path
            d=" M 1043.909 570.137 L 1041.409 570.137 C 1040.409 570.137 1039.909 569.637 1039.909 568.637 L 1039.909 559.637 C 1039.909 558.637 1040.409 558.137 1041.409 558.137 L 1050.409 558.137 C 1051.909 558.137 1051.909 559.605 1051.909 559.637 L 1051.909 562.137 L 1050.909 562.137 L 1050.909 559.137 L 1040.909 559.137 L 1040.909 569.137 L 1043.909 569.137 L 1043.909 570.137 Z  M 1052.909 565.137 L 1049.909 567.137 L 1052.909 570.137 L 1051.909 571.137 L 1048.909 568.137 L 1046.909 571.137 L 1044.909 563.137 L 1052.909 565.137 Z "
            fill={color}
          />
        </g>
      </g>
    </svg>
  );
}
