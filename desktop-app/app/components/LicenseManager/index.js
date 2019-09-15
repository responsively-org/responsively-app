import React from 'react';
import WelcomeScreen from './WelcomeScreen';
import Spinner from '../Spinner';

import styles from './style.css';
import {getLicensekey, validateLicenseKey} from '../../utils/licenseUtils';
import {initWS, cleanUp} from './ws';
import {DEACTIVATION_REASON} from '../../constants/license';

const LICENSE_STATUS = {
  VALIDATING: 'VALIDATING',
  VALID: 'VALID',
  INVALID: 'INVALID',
};
export default class LicenseManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: LICENSE_STATUS.VALIDATING,
      deactivationReason: null,
    };
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    this.cleanUpState();
  }

  init = async () => {
    const {status} = await validateLicenseKey(getLicensekey());
    if (!status) {
      return this.setState({status: LICENSE_STATUS.INVALID});
    }
    this.onActivation();
  };

  initializeWS = () => {
    try {
      const {socket, sendMessage} = initWS(
        `${process.env.WEBSOCKET_URL}?licenseKey=${getLicensekey()}`,
        this.onWSMessage
      );
      this.sendMessage = sendMessage;
      this.socket = socket;
      this.setState({status: LICENSE_STATUS.VALID});
      this.intervalHandle = setInterval(this.periodicPing, 20000);
    } catch (err) {
      console.log('err', err);
    }
  };

  periodicPing = () => {
    this.sendMessage('validate', {
      licenseKey: getLicensekey(),
    });
  };

  onWSMessage = (type, message) => {
    if (type === 'validate_response') {
      if (!message.status) {
        this.deactivate();
      }
    }
  };

  deactivate = () => {
    this.cleanUpState();
    this.setState({
      status: LICENSE_STATUS.INVALID,
      deactivationReason: DEACTIVATION_REASON.REVALIDATION,
    });
  };

  cleanUpState = () => {
    cleanUp(this.socket);
    this.socket = null;
    this.sendMessage = null;

    this.intervalHandle &&
      window.clearInterval(this.intervalHandle) &&
      (this.intervalHandle = null);
  };

  onActivation = () => {
    this.setState({status: LICENSE_STATUS.VALID, deactivationReason: null});
    this.initializeWS();
  };

  render() {
    if (this.state.status === LICENSE_STATUS.VALIDATING) {
      return <Spinner size={50} />;
    }

    if (this.state.status === LICENSE_STATUS.VALID) {
      return this.props.children;
    }

    return (
      <WelcomeScreen
        onActivation={this.onActivation}
        reason={this.state.deactivationReason}
        licenseKey={getLicensekey()}
      />
    );
  }
}
