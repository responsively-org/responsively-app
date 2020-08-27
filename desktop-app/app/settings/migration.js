import settings from 'electron-settings';
import {ACTIVE_DEVICES, USER_PREFERENCES} from '../constants/settingKeys';
import {PERMISSION_MANAGEMENT_OPTIONS} from '../constants/permissionsManagement';

export function migrateDeviceSchema() {
  if (settings.get('USER_PREFERENCES')) {
    settings.set(USER_PREFERENCES, settings.get('USER_PREFERENCES'));
    settings.delete('USER_PREFERENCES');
  }

  _handleScreenshotPreferences();
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

const _handleScreenshotPreferences = () => {
  const userPreferences = settings.get(USER_PREFERENCES) || {};

  if (userPreferences.removeFixedPositionedElements != null) {
    return;
  }

  userPreferences.removeFixedPositionedElements = true;
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
