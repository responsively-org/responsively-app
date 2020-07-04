import React, {Fragment} from 'react';

export default ({width, height, color, padding, margin}) => (
  <Fragment>
    {/* <svg
      width={width}
      height={height}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path d="M9.71,6.29a1,1,0,0,0-1.42,0l-5,5a1,1,0,0,0,0,1.42l5,5a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L5.41,12l4.3-4.29A1,1,0,0,0,9.71,6.29Zm11,5-5-5a1,1,0,0,0-1.42,1.42L18.59,12l-4.3,4.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5A1,1,0,0,0,20.71,11.29Z" />
    </svg> */}
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
