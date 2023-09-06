import React, {Fragment} from 'react';

const Bug = ({width, height, color, padding, margin}) => (
  <Fragment>
    <svg
      width={width}
      height={height}
      fill={color}
      style={{padding, margin}}
      viewBox="0 0 100 100"
      x="0px"
      y="0px"
    >
      <g data-name="Group">
        <polygon
          data-name="Path"
          points="39.5 23.6 13.1 50 39.5 76.4 42.4 73.6 18.8 50 42.4 26.4 39.5 23.6"
        />
        <polygon
          data-name="Path"
          points="60.5 76.4 86.9 50 60.5 23.6 57.6 26.4 81.2 50 57.6 73.6 60.5 76.4"
        />
      </g>
    </svg>
  </Fragment>
);

Bug.defaultProps = {
  color: 'currentColor',
};

export default Bug;
