// @flow
import React from 'react';
import logoImage from '../../../resources/logo.svg';

export default function Logo({
  width,
  height,
  color,
  padding,
  margin,
  className,
}) {
  return (
    <img
      src={logoImage}
      height={height}
      width={width}
      alt=""
      className={`logoIcon ${className ?? ''}`}
    />
  );
}
