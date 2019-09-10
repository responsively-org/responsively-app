// @flow
import React, {useState, useEffect} from 'react';
import WelcomeScreen from './WelcomeScreen';
import Spinner from '../Spinner';

import styles from './style.css';
import {getLicensekey, validateLicenseKey} from '../../utils/licenseUtils';
import {initWS} from './ws';

const LICENSE_STATUS = {
  VALIDATING: 'VALIDATING',
  VALID: 'VALID',
  INVALID: 'INVALID',
};

export default function LicenseManager(props) {
  const [initialValidationStatus, setInitialValidationStatus] = useState(false);
  const [status, setStatus] = useState(LICENSE_STATUS.VALIDATING);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    (async () => {
      if (initialValidationStatus) {
        return;
      }
      const licenseKey = getLicensekey();
      const {status} = await validateLicenseKey(licenseKey);
      if (status) {
        onActivation();
      } else {
        setStatus(LICENSE_STATUS.INVALID);
      }
      setInitialValidationStatus(true);
    })();
  });

  const onMessage = (type, message) => {
    if (type === 'LICENSE_STATUS') {
      if (message.status === LICENSE_STATUS.INVALID) {
        setStatus(LICENSE_STATUS.INVALID);
      }
    }
  };

  const onActivation = () => {
    console.log('onActivation');
    setStatus(LICENSE_STATUS.VALID);
    try {
      setSocket(initWS(process.env.WEBSOCKET_URL, onMessage));
    } catch (err) {
      console.log('err', err);
    }
  };

  if (status === LICENSE_STATUS.VALIDATING) {
    return <Spinner size={50} />;
  }

  if (status === LICENSE_STATUS.VALID) {
    return props.children;
  }

  return <WelcomeScreen onActivation={onActivation} />;
}
