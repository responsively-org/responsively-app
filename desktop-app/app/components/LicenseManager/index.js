// @flow
import React, {useState, useEffect} from 'react';
import WelcomeScreen from './WelcomeScreen';
import Spinner from '../Spinner';

import styles from './style.css';
import {getLicensekey, validateLicenseKey} from '../../utils/licenseUtils';

export default function LicenseManager(props) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    (async () => {
      const licenseKey = getLicensekey();
      const {status} = await validateLicenseKey(licenseKey);
      console.log('status', status);
      if (status) {
        setStatus('true');
      } else {
        setStatus('false');
      }
    })();
  });

  const onActivation = () => {
    setStatus(true);
  };

  if (status === 'loading') {
    return <Spinner size={50} />;
  }

  if (status === 'true') {
    return props.children;
  }

  return <WelcomeScreen onActivation={onActivation} />;
}
