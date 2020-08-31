import React, {useMemo} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import cx from 'classnames';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import SettingsIcon from '@material-ui/icons/Settings';

import useCommonStyles from '../useCommonStyles';
import useStyles from './useStyles';
import Select from '../Select';
import {DEVTOOLS_MODES} from '../../constants/previewerLayouts';
import {SYSTEM_THEME, LIGHT_THEME, DARK_THEME} from '../../constants/theme';
import ScreenShotSavePreference from '../ScreenShotSavePreference/index';
import {userPreferenceSettings} from '../../settings/userPreferenceSettings';
import {SCREENSHOT_MECHANISM} from '../../constants/values';
import {notifyPermissionPreferenceChanged} from '../../utils/permissionUtils.js';
import {PERMISSION_MANAGEMENT_OPTIONS} from '../../constants/permissionsManagement';
import {setTheme} from '../../actions/browser';

function UserPreference({
  devToolsConfig,
  userPreferences,
  onUserPreferencesChange,
  onDevToolsModeChange,
}) {
  const classes = useStyles();
  const commonClasses = useCommonStyles();
  const dispatch = useDispatch();
  const themeSource = useSelector(state => state.browser.theme);
  const selectedThemeOption = useMemo(
    () => themeOptions.find(option => option.value === themeSource),
    [themeSource]
  );

  const onChange = (field, value) => {
    onUserPreferencesChange({...userPreferences, [field]: value});
  };

  return (
    <div className={commonClasses.sidebarContentSection}>
      <div className={commonClasses.sidebarContentSectionTitleBar}>
        <SettingsIcon width={26} margin={2} /> User Preferences
      </div>
      <div className={commonClasses.sidebarContentSectionContainer}>
        <div
          className={cx(
            commonClasses.flexAlignVerticalMiddle,
            classes.sectionHeader
          )}
        >
          General
        </div>
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
              <span className={classes.preferenceName}>
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
              <span className={classes.preferenceName}>
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
              <span className={classes.preferenceName}>
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
                classes={{root: classes.preferenceColor}}
              />
            }
            label={
              <span className={classes.preferenceName}>
                Device Outline Color
              </span>
            }
          />
        </div>
        <div className={classes.marginTop}>
          <Typography component="span" className={classes.preferenceName}>
            Theme:
          </Typography>
          <div className={classes.marginTop}>
            <Select
              options={themeOptions}
              value={selectedThemeOption}
              onChange={option => dispatch(setTheme(option.value))}
            />
          </div>
        </div>
      </div>
      <div className={commonClasses.sidebarContentSectionContainer}>
        <div
          className={cx(
            commonClasses.flexAlignVerticalMiddle,
            classes.sectionHeader
          )}
        >
          Screenshot
        </div>
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
              <span className={classes.preferenceName}>
                Hide fixed positioned elements
              </span>
            }
          />
        </div>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  userPreferences.screenshotMechanism ===
                  SCREENSHOT_MECHANISM.V2
                }
                onChange={e =>
                  onChange(
                    'screenshotMechanism',
                    e.target.checked
                      ? SCREENSHOT_MECHANISM.V2
                      : SCREENSHOT_MECHANISM.V1
                  )
                }
                name="Use improved mechanism"
                color="primary"
              />
            }
            label={
              <span className={classes.preferenceName}>
                Use improved mechanism
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
      <div className={commonClasses.sidebarContentSectionContainer}>
        <div className={classes.preferenceName}>Permissions</div>
        <div className={classes.marginTop}>
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
          />
          <p className={classes.permissionsSelectorSmallNote}>
            <strong>Note:</strong> To ensure this behaviour you should restart
            Responsively
          </p>
        </div>
      </div>
    </div>
  );
}

const permissionsOptions = [
  {
    value: PERMISSION_MANAGEMENT_OPTIONS.ALLOW_ALWAYS,
    label: PERMISSION_MANAGEMENT_OPTIONS.ALLOW_ALWAYS,
  },
  {
    value: PERMISSION_MANAGEMENT_OPTIONS.DENY_ALWAYS,
    label: PERMISSION_MANAGEMENT_OPTIONS.DENY_ALWAYS,
  },
  {
    value: PERMISSION_MANAGEMENT_OPTIONS.ASK_ALWAYS,
    label: PERMISSION_MANAGEMENT_OPTIONS.ASK_ALWAYS,
  },
];

const themeOptions = [
  {value: SYSTEM_THEME, label: 'System preference'},
  {value: LIGHT_THEME, label: 'Light'},
  {value: DARK_THEME, label: 'Dark'},
];

export default UserPreference;
