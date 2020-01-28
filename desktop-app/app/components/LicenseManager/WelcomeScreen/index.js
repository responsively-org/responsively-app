// @flow
import React, {useState} from 'react';
import url from 'url';
import {validateEmail} from '../../../utils/generalUtils';
import {shell} from 'electron';
import path from 'path';
import cx from 'classnames';
import styles from './style.css';
import {saveLicenseKey, validateLicenseKey} from '../../../utils/licenseUtils';
import {DEACTIVATION_REASON} from '../../../constants/license';

export default function WelcomeScreen(props) {
  const [activeSection, setActiveSection] = useState('license');
  const [licenseKey, setLicenseKey] = useState(props.licenseKey);
  const [trialEmail, setTrialEmail] = useState('');
  const [trialActivationStatus, setTrialActivationStatus] = useState('');
  const [
    trialActivationErrorMessage,
    setTrialActivationErrorMessage,
  ] = useState('');
  const [licenseActivationStatus, setLicenseActivationStatus] = useState('');
  const [
    licenseActivationErrorMessage,
    setLicenseActivationErrorMessage,
  ] = useState('');

  const isLicenseActive = activeSection === 'license';
  const isTrialActive = activeSection === 'trial';

  const trialEmailChange = e => {
    setTrialEmail(e.target.value);
    setTrialActivationStatus('');
    setTrialActivationErrorMessage('');
  };

  const licenseKeyChange = e => {
    setLicenseKey(e.target.value);
    setLicenseActivationStatus('');
    setLicenseActivationErrorMessage('');
  };

  const activateTrial = async () => {
    if (!validateEmail(trialEmail)) {
      setTrialActivationStatus('false');
      setTrialActivationErrorMessage(
        'Invalid email address, please enter a valid one to proceed'
      );
      return;
    }
    setTrialActivationStatus('loading');
    try {
      const response = await fetch(
        `${path.join(
          process.env.REST_BASE_URL,
          '/activate-trial'
        )}?email=${trialEmail}`
      );
      const body = await response.json();
      console.log('activating trial', body);
      if (body.status) {
        setTrialActivationStatus('true');
      } else {
        setTrialActivationStatus('false');
        setTrialActivationErrorMessage('Trial activation failed');
      }
    } catch (err) {
      setTrialActivationStatus('false');
      setTrialActivationErrorMessage('Trial activation failed');
    }
  };

  const activateLicense = async () => {
    console.log('activate license', licenseKey);
    setLicenseActivationStatus('loading');
    const {status, reason} = await validateLicenseKey(licenseKey);
    console.log('response', {status, reason});
    setLicenseActivationStatus(status.toString());
    setLicenseActivationErrorMessage(reason);
    if (status) {
      saveLicenseKey(licenseKey);
      setTimeout(props.onActivation, 2000);
    }
  };

  const getMainTitle = () => {
    switch (props.reason) {
      case DEACTIVATION_REASON.REVALIDATION:
        return 'Sorry, we need to re-validate the license key';
      default:
        return 'Welcome, lets activate the app';
    }
  };

  alert('process.env.REST_BASE_URL', process.env.REST_BASE_URL);

  return (
    <div className={styles.container}>
      <div className={styles.title}>{getMainTitle()}</div>
      <div className={styles.mainSection}>
        <div
          className={cx(styles.mainSectionBlock, {
            [styles.active]: isLicenseActive,
          })}
          onMouseEnter={() => setActiveSection('license')}
        >
          <div className={styles.subTitle}>Enter license key</div>
          <div>
            <div className={styles.desc}>
              Please enter the license key that you have recieved on your email
            </div>
            <div
              className={cx(styles.inputContainer, {
                [styles.active]: isLicenseActive,
              })}
            >
              <i className={cx(styles.inputIcon, 'fa fa-lock')} />
              <input
                className={cx(styles.inputField, styles.licenseField)}
                autoFocus
                type="text"
                placeholder="License key"
                value={licenseKey}
                onChange={licenseKeyChange}
              />
              <span
                className={cx(styles.inputIcon, styles.iconButton, {
                  'fa fa-arrow-right': licenseActivationStatus !== 'loading',
                  'fa fa-circle-notch spin':
                    licenseActivationStatus === 'loading',
                })}
                onClick={activateLicense}
              />
            </div>
            <div>
              {licenseActivationStatus === 'false' &&
                licenseActivationErrorMessage && (
                  <div className={styles.errorMessage}>
                    {licenseActivationErrorMessage}
                  </div>
                )}
              {licenseActivationStatus === 'true' && (
                <div className={styles.successMessage}>
                  License key validation successful, please wait a moment.{' '}
                  <span className="fa fa-circle-notch spin" />
                </div>
              )}
            </div>
            <div
              className={cx(styles.buyLicenseContainer, {
                [styles.active]: isLicenseActive,
              })}
            >
              <div className={cx(styles.desc, styles.afterDesc)}>
                Don't have a license key? Buy one from here.
              </div>
              <div
                className={styles.buyLicenseButton}
                onClick={() =>
                  shell.openExternal('https://responsively.app#pricing')
                }
              >
                Buy License
              </div>
            </div>
          </div>
        </div>
        <div className={styles.sectionDividerContainer}>
          <div className={styles.sectionDivider}>
            <div className={styles.sectionDividerLine} />
            {/*<div className={styles.orText}>OR</div>
            <div className={styles.sectionDividerLine} />*/}
          </div>
        </div>
        <div
          className={cx(styles.mainSectionBlock, {
            [styles.active]: isTrialActive,
          })}
          onMouseEnter={() => setActiveSection('trial')}
        >
          <div className={styles.subTitle}>Activate trial</div>
          <div>
            <div className={styles.desc}>
              Please enter your email address to activate free trial
            </div>
            <div
              className={cx(styles.inputContainer, {
                [styles.active]: isTrialActive,
              })}
            >
              <input
                className={cx(styles.inputField)}
                type="text"
                placeholder="Email address"
                name="email"
                value={trialEmail}
                onChange={trialEmailChange}
              />

              <span
                className={cx(styles.inputIcon, styles.iconButton, {
                  'fa fa-arrow-right': trialActivationStatus !== 'loading',
                  'fa fa-circle-notch spin':
                    trialActivationStatus === 'loading',
                })}
                onClick={activateTrial}
              />
            </div>
            <div>
              {trialActivationStatus === 'false' &&
                trialActivationErrorMessage && (
                  <div className={styles.errorMessage}>
                    {trialActivationErrorMessage}
                  </div>
                )}
              {trialActivationStatus === 'true' && (
                <div className={styles.successMessage}>
                  Trial Activated, please check your email for the trial license
                  key
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
