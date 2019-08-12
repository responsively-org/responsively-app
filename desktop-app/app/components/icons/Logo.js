import React, {Fragment} from 'react';
import logoImage from '../../../resources/logo.svg';

export default ({width, height, color}) => (
  <img src={logoImage} height={height} width={width} />
);
