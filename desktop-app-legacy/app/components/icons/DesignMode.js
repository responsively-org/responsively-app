import React, {Fragment} from 'react';

export default ({width, height, color, padding, margin}) => (
  <Fragment>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      version="1.1"
      x="0px"
      y="0px"
      height={height}
      width={width}
      fill={color}
      style={{padding, margin}}
      className="designModeIcon"
      viewBox="0 0 36 36"
    >
      <path
        d="M28 30H6V8h13.22l2-2H6a2 2 0 0 0-2 2v22a2 2 0 0 0 2 2h22a2 2 0 0 0 2-2V15l-2 2z"
        className="clr-i-outline clr-i-outline-path-1"
        fill="currentColor"
      />
      <path
        d="M33.53 5.84l-3.37-3.37a1.61 1.61 0 0 0-2.28 0L14.17 16.26l-1.11 4.81A1.61 1.61 0 0 0 14.63 23a1.69 1.69 0 0 0 .37 0l4.85-1.07L33.53 8.12a1.61 1.61 0 0 0 0-2.28zM18.81 20.08l-3.66.81l.85-3.63L26.32 6.87l2.82 2.82zM30.27 8.56l-2.82-2.82L29 4.16L31.84 7z"
        className="clr-i-outline clr-i-outline-path-2"
        fill="currentColor"
      />
    </svg>
  </Fragment>
);
