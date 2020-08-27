import React from 'react';
import cx from 'classnames';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import SettingsIcon from '@material-ui/icons/Settings';
import Select from 'react-select';

import commonStyles from '../common.styles.css';
import styles from './styles.module.css';
import {DEVTOOLS_MODES} from '../../constants/previewerLayouts';
import ScreenShotSavePreference from '../ScreenShotSavePreference/index';
import {userPreferenceSettings} from '../../settings/userPreferenceSettings';
import {notifyPermissionPreferenceChanged} from '../../utils/permissionUtils.js';
const selectStyles = {
  control: selectStyles => ({...selectStyles, backgroundColor: '#ffffff10'}),
  option: (selectStyles, {data, isDisabled, isFocused, isSelected}) => {
    const color = 'white';
    return {
      ...selectStyles,
      backgroundColor: isDisabled
        ? null
        : isSelected
        ? '#ffffff40'
        : isFocused
        ? '#ffffff20'
        : null,
      color: 'white',

      ':active': {
        ...selectStyles[':active'],
        backgroundColor: !isDisabled && '#ffffff40',
      },
    };
  },
  input: selectStyles => ({...selectStyles}),
  placeholder: selectStyles => ({...selectStyles}),
  singleValue: (selectStyles, {data}) => ({...selectStyles, color: 'white'}),
  menu: selectStyles => ({...selectStyles, background: '#4b4b4b', zIndex: 100}),
};

const permissionsOptions = [
  {value: 'Allow always', label: 'Allow always'},
  {value: 'Deny always', label: 'Deny always'},
  {value: 'Ask always', label: 'Ask always'},
];

export default function UserPreference({
  devToolsConfig,
  userPreferences,
  onUserPreferencesChange,
  onDevToolsModeChange,
}) {
  const onChange = (field, value) => {
    onUserPreferencesChange({...userPreferences, [field]: value});
  };

  return (
    <div className={cx(commonStyles.sidebarContentSection)}>
      <div className={cx(commonStyles.sidebarContentSectionTitleBar)}>
        <SettingsIcon width={26} margin={2} /> User Preferences
      </div>
      <div className={cx(commonStyles.sidebarContentSectionContainer)}>
        <div className={styles.sectionHeader}>General</div>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={userPreferences.disableSSLValidation || false}
                onChange={e =>
                  onChange('disableSSLValidation', e.target.checked)
                }
                name="Disable SSL Validation"
                color="primary"
              />
            }
            label={
              <span className={cx(styles.preferenceName)}>
                Disable SSL Validation
              </span>
            }
          />
        </div>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={devToolsConfig.mode !== DEVTOOLS_MODES.UNDOCKED}
                onChange={e => {
                  if (e.target.checked) {
                    onDevToolsModeChange(DEVTOOLS_MODES.BOTTOM);
                  } else {
                    onDevToolsModeChange(DEVTOOLS_MODES.UNDOCKED);
                  }
                }}
                name="Dock dev-tools to Main Window"
                color="primary"
              />
            }
            label={
              <span className={cx(styles.preferenceName)}>
                Dock dev-tools to Main Window
              </span>
            }
          />
        </div>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={userPreferences.reopenLastAddress || false}
                onChange={e => onChange('reopenLastAddress', e.target.checked)}
                name="Reopen last page during startup"
                color="primary"
              />
            }
            label={
              <span className={cx(styles.preferenceName)}>
                Reopen last page during startup
              </span>
            }
          />
        </div>
        <div>
          <FormControlLabel
            control={
              <Input
                type="color"
                onChange={e => onChange('deviceOutlineStyle', e.target.value)}
                name="Device Outline Color"
                color="primary"
                value={userPreferences.deviceOutlineStyle}
                classes={{root: cx(styles.preferenceColor)}}
              />
            }
            label={
              <span className={cx(styles.preferenceName)}>
                Device Outline Color
              </span>
            }
          />
        </div>
      </div>
      <div className={cx(commonStyles.sidebarContentSectionContainer)}>
        <div className={styles.sectionHeader}>Screenshot</div>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={userPreferences.removeFixedPositionedElements || false}
                onChange={e =>
                  onChange('removeFixedPositionedElements', e.target.checked)
                }
                name="Hide fixed positioned elements"
                color="primary"
              />
            }
            label={
              <span className={cx(styles.preferenceName)}>
                Hide fixed positioned elements
              </span>
            }
          />
        </div>
        <ScreenShotSavePreference
          screenShotSavePath={
            userPreferences.screenShotSavePath ||
            userPreferenceSettings.getDefaultScreenshotpath()
          }
          onScreenShotSaveLocationChange={onChange}
        />
      </div>
      <div className={cx(commonStyles.sidebarContentSectionContainer)}>
        <div className={styles.sectionHeader}>Permissions</div>
        <div className={styles.permissionsSelectorContainer}>
          <Select
            options={permissionsOptions}
            value={
              permissionsOptions.find(
                x => x.value === userPreferences?.permissionManagement
              ) || permissionsOptions[0]
            }
            onChange={val => {
              notifyPermissionPreferenceChanged(val.value);
              onChange('permissionManagement', val.value);
            }}
            styles={selectStyles}
          />
          <p className={styles.permissionsSelectorSmallNote}>
            <strong>Note:</strong> To ensure this behaviour you should restart
            Responsively
          </p>
        </div>
      </div>
    </div>
  );
}
