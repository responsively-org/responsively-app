import React, {Fragment} from 'react';

const Screenshot = ({width, height, color, padding, margin}) => (
  <svg
    width={width}
    height={height}
    fill={color}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className="quickScreenshot"
  >
    <path
      d="M35 28C34.2193 28.007 33.6091 28.4026 33.2812 28.9687L26.8438 40H14C9.6026 40 6 43.6026 6 48V86C6 90.3974 9.6026 94 14 94H76C80.3974 94 84 90.3974 84 86V48C84 43.6026 80.3974 40 76 40H63.1562L56.7188 28.9687C56.3641 28.3795 55.6877 27.9983 55 28H35ZM36.125 32H53.875L60.2812 43C60.6281 43.6007 61.3063 43.9953 62 44H76C78.2506 44 80 45.7494 80 48V86C80 88.2505 78.2506 90 76 90H14C11.7494 90 10 88.2505 10 86V48C10 45.7494 11.7494 44 14 44H28C28.6937 43.995 29.3719 43.6007 29.7188 43L36.125 32ZM45 50C36.1871 50 29 57.1871 29 66C29 74.8128 36.1871 82 45 82C53.8129 82 61 74.8128 61 66C61 57.1871 53.8129 50 45 50ZM45 54C51.6511 54 57 59.3489 57 66C57 72.6511 51.6511 78 45 78C38.3489 78 33 72.6511 33 66C33 59.3489 38.3489 54 45 54Z"
      fill={color}
    />
    <path
      d="M59 27.6102L66.5758 5H84L73.3939 23.7119H80.9697L59 51L66.5758 27.6102H59Z"
      fill={color}
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

Screenshot.defaultProps = {
  color: 'currentColor',
};

export default Screenshot;
