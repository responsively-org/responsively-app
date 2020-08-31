import settings from 'electron-settings';
import {ACTIVE_DEVICES, USER_PREFERENCES} from '../constants/settingKeys';
import {SCREENSHOT_MECHANISM} from '../constants/values';
import {PERMISSION_MANAGEMENT_OPTIONS} from '../constants/permissionsManagement';

export function migrateDeviceSchema() {
  if (settings.get('USER_PREFERENCES')) {
    settings.set(USER_PREFERENCES, settings.get('USER_PREFERENCES'));
    settings.delete('USER_PREFERENCES');
  }

  _handleScreenshotMechanismPreferences();
  _handleScreenshotFixedElementsPreferences();
  _handleDeviceSchema();
  _handlePermissionsDefaultPreferences();
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
  // If mechanism is not set previously and initialized to v2, then set removeFixedPositionedElements to false
  // as that was mainly required for the v1 mechanism.
  userPreferences.removeFixedPositionedElements = false;
  settings.set(USER_PREFERENCES, userPreferences);
};

const _handlePermissionsDefaultPreferences = () => {
  const userPreferences = settings.get(USER_PREFERENCES) || {};

  if (userPreferences.permissionManagement != null) {
    return;
  }

  userPreferences.permissionManagement =
    PERMISSION_MANAGEMENT_OPTIONS.ALLOW_ALWAYS;
  settings.set(USER_PREFERENCES, userPreferences);
};

export default {migrateDeviceSchema};
