import React, {Fragment} from 'react';

export default ({width, height, color, padding, margin}) => (
  <Fragment>
    <svg
      height={height}
      width={width}
      style={{padding, margin}}
      viewBox="0 0 1240 1240"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className="drawerCloseIcon"
    >
      <g
        id="chevronsLeft"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g
          id="Group"
          transform="translate(619.500000, 620.000000) rotate(90.000000) translate(-619.500000, -620.000000) translate(409.000000, 406.000000)"
          stroke={color}
          strokeWidth="50"
        >
          <polyline
            id="Path"
            transform="translate(210.500000, 321.000000) scale(1, -1) translate(-210.500000, -321.000000) "
            points="0 428 210.5 214 421 428"
          />
          <polyline
            id="Path"
            transform="translate(210.500000, 107.000000) scale(1, -1) translate(-210.500000, -107.000000) "
            points="0 214 210.5 0 421 214"
          />
        </g>
      </g>
    </svg>
  </Fragment>
);
