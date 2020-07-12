import settings from 'electron-settings';
import {USER_PREFERENCES} from '../constants/settingKeys';
import * as os from 'os';

const path = require('path');

class UserPreferenceSettings {
  getScreenShotSavePath = () =>
    settings.get(USER_PREFERENCES).screenShotSavePath;
}

const userPreferenceSettingsInstance = new UserPreferenceSettings();

export {userPreferenceSettingsInstance as userPreferenceSettings};
