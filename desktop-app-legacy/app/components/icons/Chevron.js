import React from 'react';

/**
 * Flattened Chevron icon.
 */
export default ({width, height, color, padding, margin}) => (
  <svg
    height={height}
    width={width}
    style={{padding, margin}}
    viewBox={`0 0 ${width} ${height}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
  >
    <path
      d="M1 6.5L9.5 2L18 6.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
