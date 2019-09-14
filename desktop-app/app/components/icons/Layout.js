import React, {Fragment} from 'react';

export default ({width, height, color, padding, margin}) => (
  <Fragment>
    <svg
      height={height}
      width={width}
      fill={color}
      style={{padding, margin}}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      x="0px"
      y="0px"
      viewBox="0 0 32 32"
      enable-background="new 0 0 32 32"
    >
      <path d="M32 14c0 1.104-0.896 2-2 2H20c-1.104 0-2-0.896-2-2V2c0-1.104 0.896-2 2-2h10c1.104 0 2 0.896 2 2v3c0 0.552-0.447 1-1 1s-1-0.448-1-1V2H20v12h10V9c0-0.552 0.447-1 1-1s1 0.448 1 1V14z" />
      <path d="M27 32c-0.553 0-1-0.448-1-1s0.447-1 1-1h3v-8H20v8h3c0.553 0 1 0.448 1 1s-0.447 1-1 1h-3c-1.104 0-2-0.896-2-2v-8c0-1.104 0.896-2 2-2h10c1.104 0 2 0.896 2 2v8c0 1.104-0.896 2-2 2H27z" />
      <path d="M0 2c0-1.104 0.896-2 2-2h10c1.104 0 2 0.896 2 2v28c0 1.104-0.896 2-2 2H2c-1.104 0-2-0.896-2-2v-3c0-0.552 0.447-1 1-1s1 0.448 1 1v3h10V2H2v21c0 0.552-0.447 1-1 1s-1-0.448-1-1V2z" />
    </svg>
  </Fragment>
);
