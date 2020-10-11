import React, {Fragment} from 'react';

const Unfocus = ({width, height, color, padding, margin}) => (
  <Fragment>
    <svg
      height={height}
      width={width}
      style={{padding, margin}}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="725.999 355.999 103.001 103.001"
    >
      <defs>
        <clipPath id="_clipPath_h8sxV9rYEahs9RnRvaBS9986KyxpspD8">
          <rect x="725.999" y="355.999" width="103.001" height="103.001" />
        </clipPath>
      </defs>
      <g clipPath="url(#_clipPath_h8sxV9rYEahs9RnRvaBS9986KyxpspD8)">
        <g>
          <path
            d=" M 752.499 450.801 C 728.601 437.003 720.4 406.398 734.198 382.499 C 747.996 358.601 778.601 350.4 802.499 364.198 C 826.398 377.996 834.598 408.601 820.801 432.499 C 807.003 456.398 776.398 464.598 752.499 450.801 Z "
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeWidth="1"
            stroke={color}
            strokeLinejoin="miter"
            strokeLinecap="square"
            strokeMiterlimit="3"
          />
          <path
            d=" M 745.681 414.57 L 768.661 416.338 L 770.429 439.319"
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeWidth="1"
            stroke={color}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeMiterlimit="3"
          />
          <path
            d=" M 784.571 375.679 L 786.339 398.66 L 809.32 400.428"
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeWidth="1"
            stroke={color}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeMiterlimit="3"
          />
        </g>
      </g>
    </svg>
  </Fragment>
);

Unfocus.defaultProps = {
  color: 'currentColor',
};

export default Unfocus;
