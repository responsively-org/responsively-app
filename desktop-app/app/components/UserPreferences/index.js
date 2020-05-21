import React from 'react';
import cx from 'classnames';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import SettingsIcon from '@material-ui/icons/Settings';

import commonStyles from '../common.styles.css';
import styles from './styles.module.css';

export default function UserPreference(props) {
  const onChange = (field, value) => {
    props.onUserPreferencesChange({...props.userPreferences, [field]: value});
  };
  return (
    <div className={cx(commonStyles.sidebarContentSection)}>
      <div className={cx(commonStyles.sidebarContentSectionTitleBar)}>
        <SettingsIcon color="white" width={26} margin={2} /> User Preferences
      </div>
      <div className={cx(commonStyles.sidebarContentSectionContainer)}>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={props.userPreferences.disableSSLValidation || false}
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
      </div>
    </div>
  );
}
