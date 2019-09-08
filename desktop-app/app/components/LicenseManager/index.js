// @flow
import React, {useState} from 'react';
import WelcomeScreen from '../WelcomeScreen';

import styles from './style.css';

export default function LicenseManager(props) {
  const [status, setStatus] = useState(true);

  if (status) {
    return props.children;
  }

  return <WelcomeScreen />;
}
