import settings from 'electron-settings';
import {ACTIVE_DEVICES, USER_PREFERENCES} from '../constants/settingKeys';
import {SCREENSHOT_MECHANISM} from '../constants/values';

export function migrateDeviceSchema() {
  if (settings.get('USER_PREFERENCES')) {
    settings.set(USER_PREFERENCES, settings.get('USER_PREFERENCES'));
    settings.delete('USER_PREFERENCES');
  }

  _handleScreenshotFixedElementsPreferences();
  _handleScreenshotMechanismPreferences();
  _handleDeviceSchema();
}

const _handleDeviceSchema = () => {
  const activeDevices = settings.get(ACTIVE_DEVICES);
  if (!activeDevices || !activeDevices.length || !activeDevices[0].width) {
    return;
  }
  settings.set(
    ACTIVE_DEVICES,
    activeDevices.map(device => device.name)
  );
};

const _handleScreenshotFixedElementsPreferences = () => {
  const userPreferences = settings.get(USER_PREFERENCES) || {};

  if (userPreferences.removeFixedPositionedElements != null) {
    return;
  }

  userPreferences.removeFixedPositionedElements = true;
  settings.set(USER_PREFERENCES, userPreferences);
};

const _handleScreenshotMechanismPreferences = () => {
  const userPreferences = settings.get(USER_PREFERENCES) || {};

  if (userPreferences.screenshotMechanism != null) {
    return;
  }

  userPreferences.screenshotMechanism = SCREENSHOT_MECHANISM.V2;
  settings.set(USER_PREFERENCES, userPreferences);
};

export default {migrateDeviceSchema};
