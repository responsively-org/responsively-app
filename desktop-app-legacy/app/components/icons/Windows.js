import React, {Fragment} from 'react';

export default ({width, height, color, padding, margin}) => (
  <Fragment>
    <svg
      height={height}
      width={width}
      fill={color}
      style={{padding, margin}}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 88 88"
      className="windowsIcon"
    >
      <path d="m0 12.402 35.687-4.8602.0156 34.423-35.67.20313zm35.67 33.529.0277 34.453-35.67-4.9041-.002-29.78zm4.3261-39.025 47.318-6.906v41.527l-47.318.37565zm47.329 39.349-.0111 41.34-47.318-6.6784-.0663-34.739z" />
    </svg>
  </Fragment>
);
