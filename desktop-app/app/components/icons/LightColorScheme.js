import React, {Fragment} from 'react';

export default ({width, height, color, padding, margin, className}) => (
  <Fragment>
    <svg
      height={height}
      width={width}
      stroke={color}
      style={{padding, margin}}
      className={className}
      fill="transparent"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path d="M17.5 12C17.5 15.0376 15.0376 17.5 12 17.5C8.96243 17.5 6.5 15.0376 6.5 12C6.5 8.96243 8.96243 6.5 12 6.5C15.0376 6.5 17.5 8.96243 17.5 12Z" />
      <path d="M4 4L6 6M20 12H23H20ZM1 12H4H1ZM12 20V23V20ZM12 1V4V1ZM18 6L20 4L18 6ZM4 20L6 18L4 20ZM18 18L20 20L18 18Z" />
    </svg>
  </Fragment>
);
