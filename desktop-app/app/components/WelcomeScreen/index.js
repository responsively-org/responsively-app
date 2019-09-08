// @flow
import React, {useState} from 'react';
import {shell} from 'electron';
import cx from 'classnames';
import styles from './style.css';

export default function LicenseManager(props) {
  const [activeSection, setActiveSection] = useState('license');
  const [licenseKey, setLicenseKey] = useState('');
  const [trialEmail, setTrialEmail] = useState('');
  const isLicenseActive = activeSection === 'license';
  const isTrialActive = activeSection === 'trial';
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
              <i
                className={cx(
                  styles.inputIcon,
                  styles.iconButton,
                  'fa fa-arrow-right'
                )}
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
                onChange={e => setTrialEmail(e.target.value)}
              />
              <i
                className={cx(
                  styles.inputIcon,
                  styles.iconButton,
                  'fa fa-arrow-right'
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
