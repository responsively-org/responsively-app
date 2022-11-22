import React from 'react';

function Filter({width, height, color, className}) {
  return (
    <svg
      width={width}
      height={height}
      stroke={color}
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );
}

Filter.defaultProps = {
  color: 'currentColor',
};

export default Filter;
