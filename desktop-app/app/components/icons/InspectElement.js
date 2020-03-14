import React, {Fragment} from 'react';

export default ({width, height, color, padding, margin}) => (
  <Fragment>
    <svg
      height={height}
      width={width}
      fill={color}
      style={{padding, margin}}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="563.5 323.5 162.599 156.526"
    >
      <path
        d=" M 595 340 L 665 340 C 673.279 340 680 346.721 680 355 L 680 425 C 680 433.279 673.279 440 665 440 L 595 440 C 586.721 440 580 433.279 580 425 L 580 355 C 580 346.721 586.721 340 595 340 Z "
        vectorEffect="non-scaling-stroke"
        strokeWidth="1"
        stroke={color}
        strokeLinejoin="miter"
        strokeLinecap="square"
        strokeMiterlimit="3"
        fill="none"
      />
      <g>
        <path
          d=" M 653.959 477.588 L 615.403 363.46 L 726.099 418.249 L 677.594 434.636 L 674.982 436.313 L 653.959 477.588 Z "
          fill={'black'}
        />
        <path
          d=" M 720.556 460.652 L 698.492 480.026 L 638.218 412.176 L 660.996 392.561 L 720.556 460.652 Z "
          fill={'black'}
        />
        <rect
          x="676.273"
          y="411.114"
          width="15.059"
          height="60.236"
          transform="matrix(0.75,-0.662,0.662,0.75,-120.833,563.023)"
          fill={color}
        />
        <path
          d=" M 628.319 378.169 L 655.309 458.059 L 669.719 430.144 L 672.331 428.467 L 706.57 416.9 L 628.319 378.169 Z "
          fill={color}
        />
      </g>
    </svg>
  </Fragment>
);
