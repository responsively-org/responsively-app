import React from 'react';
import cx from 'classnames';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import SettingsIcon from '@material-ui/icons/Settings';

import commonStyles from '../common.styles.css';
import styles from './styles.module.css';
import {DEVTOOLS_MODES} from '../../constants/previewerLayouts';
import ScreenShotSavePreference from '../ScreenShotSavePreference/index';
import {userPreferenceSettings} from '../../settings/userPreferenceSettings';

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
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={userPreferences.disableSSLValidation || false}
                onChange={e =>
                  onChange('disableSSLValidation', e.target.checked)
                }
                name="Diable SSL Validation"
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
                name="Dock DevTools to Main Window"
                color="primary"
              />
            }
            label={
              <span className={cx(styles.preferenceName)}>
                Dock DevTools to Main Window
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
                name="Reopen last opened address on start"
                color="primary"
              />
            }
            label={
              <span className={cx(styles.preferenceName)}>
                Reopen last opened address on start
              </span>
            }
          />
        </div>
      </div>
      <div className={cx(commonStyles.sidebarContentSectionContainer)}>
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
        <ScreenShotSavePreference
          screenShotSavePath={
            userPreferences.screenShotSavePath ||
            userPreferenceSettings.getDefaultScreenshotpath()
          }
          onScreenShotSaveLocationChange={onChange}
        />
      </div>
    </div>
  );
}
