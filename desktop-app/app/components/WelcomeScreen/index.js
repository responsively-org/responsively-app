// @flow
import React, {useState} from 'react';
import url from 'url';
import {validateEmail} from '../../utils/generalUtils';
import {shell} from 'electron';
import cx from 'classnames';
import styles from './style.css';

export default function WelcomeScreen(props) {
  const [activeSection, setActiveSection] = useState('license');
  const [licenseKey, setLicenseKey] = useState('');
  const [trialEmail, setTrialEmail] = useState('');
  const [trialActivationStatus, setTrialActivationStatus] = useState('');
  const [
    trialActivationErrorMessage,
    setTrialActivationErrorMessage,
  ] = useState('');

  const isLicenseActive = activeSection === 'license';
  const isTrialActive = activeSection === 'trial';

  const trialEmailChange = e => {
    setTrialEmail(e.target.value);
    setTrialActivationStatus('');
    setTrialActivationErrorMessage('');
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
        `${url.resolve(
          process.env.REST_BASE_URL,
          '/activate-trial'
        )}?email=${trialEmail}`
      );
      console.log('activating trial', response);
      if (response.state) {
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

  const activateLicense = () => {
    console.log('activating license');
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>Welcome, lets activate the app</div>
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
                onChange={e => setLicenseKey(e.target.value)}
              />
              <span
                className={cx(
                  styles.inputIcon,
                  styles.iconButton,
                  'fa fa-arrow-right'
                )}
                onClick={activateLicense}
              />
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
