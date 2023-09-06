import React, {Fragment} from 'react';

function Gift({width, height, color, className}) {
  return (
    <Fragment>
      <svg
        height={height}
        width={width}
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={className}
      >
        <path d="M14.83 4H20v6h-1v10H1V10H0V4h5.17A3 3 0 0 1 10 .76 3 3 0 0 1 14.83 4zM8 10H3v8h5v-8zm4 0v8h5v-8h-5zM8 6H2v2h6V6zm4 0v2h6V6h-6zM8 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm4 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
      </svg>
    </Fragment>
  );
}

Gift.defaultProps = {
  color: 'currentColor',
};

export default Gift;
