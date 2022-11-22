import React, {Fragment} from 'react';

const DeviceRotate = ({width, height, color, padding, margin}) => (
  <Fragment>
    <svg
      height={height}
      width={width}
      fill={color}
      style={{padding, margin}}
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      viewBox="0 0 100 100"
      x="0px"
      y="0px"
      className="deviceRotateIcon"
    >
      <g data-name="Group">
        <path
          data-name="Compound Path"
          d="M8.8,62.2a7.2,7.2,0,0,0,2.1,5.2L32.7,89.1a7.3,7.3,0,0,0,10.3,0L89.1,43a7.3,7.3,0,0,0,0-10.3L67.3,10.9a7.3,7.3,0,0,0-10.3,0L10.9,57A7.2,7.2,0,0,0,8.8,62.2ZM48,78.4,21.6,52,54.9,18.7,81.3,45.1ZM64.5,13.7,86.3,35.5a3.3,3.3,0,0,1,0,4.7l-2.2,2.2L57.7,15.9l2.2-2.2A3.4,3.4,0,0,1,64.5,13.7ZM13.7,59.9l5.1-5.1L45.2,81.2l-5.1,5.1a3.4,3.4,0,0,1-4.7,0L13.7,64.5a3.3,3.3,0,0,1,0-4.7Z"
        />
        <rect
          data-name="Path"
          x="26.4"
          y="69.2"
          width="4"
          height="4.88"
          transform="translate(-42.4 41.1) rotate(-45)"
        />
        <path
          data-name="Path"
          d="M92.8,68.1A14.2,14.2,0,0,1,78.6,82.3H65.8l7.4-8.7-3-2.6L58.9,84.3,70.2,97.5l3-2.6-7.4-8.6H78.6A18.2,18.2,0,0,0,96.8,68.1Z"
        />
        <path
          data-name="Path"
          d="M21.4,17.7H34.2l-7.4,8.7,3,2.6L41.1,15.7,29.8,2.5l-3,2.6,7.4,8.6H21.4A18.2,18.2,0,0,0,3.2,31.9h4A14.2,14.2,0,0,1,21.4,17.7Z"
        />
      </g>
    </svg>
  </Fragment>
);

DeviceRotate.defaultProps = {
  color: 'currentColor',
};

export default DeviceRotate;
