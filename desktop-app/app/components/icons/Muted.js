import React, {Fragment} from 'react';

export default function Muted({width, height, color, padding, margin}) {
  return (
    <Fragment>
      <svg
        viewBox="0 0 22 27.5"
        version="1.1"
        x="0px"
        y="0px"
        height={height}
        width={width}
        fill={color}
        style={{padding, margin}}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        className="muteIcon"
        xmlSpace="preserve"
      >
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <path
            d="M0,10.0029293 L0,15.9970707 C0,16.5509732 0.45097518,17 0.990777969,17 L5,17 L10.4704221,20.7253518 C11.3151847,21.4293205 12,21.1099416 12,19.9998938 L12,6.00010618 C12,4.89547804 11.3117237,4.57356358 10.4704221,5.27464823 L5,9 L0.990777969,9 C0.443586406,9 0,9.43788135 0,10.0029293 Z M5,10 L5.36204994,10 L5.6401844,9.76822128 L11,6.15551758 L11.0151624,19.8775937 L5.6401844,16.2317787 L5.36204994,16 L5,16 L0.990777969,16 C1.00229279,16 1,10.0029293 1,10.0029293 C1,9.9930141 5,10 5,10 Z"
            fill={color}
          />
        </g>
      </svg>
    </Fragment>
  );
}
