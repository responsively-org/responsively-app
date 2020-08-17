import React, {Fragment} from 'react';

export default function Kebab({width, height, color, padding, margin}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      version="1.1"
      x="0px"
      y="0px"
      viewBox="0 0 100 125"
      enableBackground="new 0 0 100 100"
      xmlSpace="preserve"
      height={height}
      width={width}
      fill={color}
      style={{padding, margin}}
      className="kebab"
    >
      <circle cx="50" cy="17.5" r="12.5" />
      <circle cx="50" cy="50" r="12.5" />
      <circle cx="50" cy="82.5" r="12.5" />
    </svg>
  );
}
