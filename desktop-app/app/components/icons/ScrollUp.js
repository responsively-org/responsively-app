import React, {Fragment} from 'react';

export default ({width, height, color, padding}) => (
  <Fragment>
    <svg
      height={height}
      width={width}
      fill={color}
      style={{padding}}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 100 100"
      version="1.1"
      x="0px"
      y="0px"
    >
      <g stroke="none" stroke-width="1" fill-rule="evenodd">
        <g>
          <path d="M42,21c0.5,0,1-0.2,1.4-0.6l6.6-6.6l6.6,6.6C57,20.8,57.5,21,58,21s1-0.2,1.4-0.6c0.8-0.8,0.8-2,0-2.8l-8-8  c-0.8-0.8-2-0.8-2.8,0l-8,8c-0.8,0.8-0.8,2,0,2.8C41,20.8,41.5,21,42,21z" />
          <path d="M40.6,31.4C41,31.8,41.5,32,42,32s1-0.2,1.4-0.6l6.6-6.6l6.6,6.6C57,31.8,57.5,32,58,32s1-0.2,1.4-0.6c0.8-0.8,0.8-2,0-2.8  l-8-8c-0.8-0.8-2-0.8-2.8,0l-8,8C39.8,29.4,39.8,30.6,40.6,31.4z" />
          <path d="M50,37c-9.9,0-18,8.1-18,18v18c0,9.9,8.1,18,18,18s18-8.1,18-18V55C68,45.1,59.9,37,50,37z M64,73c0,7.7-6.3,14-14,14  s-14-6.3-14-14V55c0-7.7,6.3-14,14-14s14,6.3,14,14V73z" />
          <path d="M50,48c-1.1,0-2,0.9-2,2v6c0,1.1,0.9,2,2,2s2-0.9,2-2v-6C52,48.9,51.1,48,50,48z" />
        </g>
      </g>
    </svg>
  </Fragment>
);
