import settings from 'electron-settings';
import {
  ACTIVE_DEVICES,
  USER_PREFERENCES,
  NETWORK_CONFIGURATION,
} from '../constants/settingKeys';
import {SCREENSHOT_MECHANISM} from '../constants/values';
import {PERMISSION_MANAGEMENT_OPTIONS} from '../constants/permissionsManagement';

export function migrateDeviceSchema() {
  if (settings.get('USER_PREFERENCES')) {
    settings.set(USER_PREFERENCES, settings.get('USER_PREFERENCES'));
    settings.delete('USER_PREFERENCES');
  }

  _ensureDefaultNetworkConfig();
  _handleScreenshotMechanismPreferences();
  _handleScreenshotFixedElementsPreferences();
  _handleDeviceSchema();
  _handlePermissionsDefaultPreferences();
}

function _ensureDefaultNetworkConfig() {
  const ntwrk = settings.get(NETWORK_CONFIGURATION) || {};

  if (ntwrk.throttling == null || ntwrk.proxy == null) {
    ntwrk.throttling =
      ntwrk.throttling || _getDefaultNetworkThrottlingProfiles();
    ntwrk.proxy = ntwrk.proxy || _getDefaultNetworkProxyProfile();
    settings.set(NETWORK_CONFIGURATION, ntwrk);
  }
}

function _getDefaultNetworkThrottlingProfiles() {
  return [
    {
      type: 'Online',
      title: 'Online',
      active: true,
    },
    {
      type: 'Offline',
      title: 'Offline',
      downloadKps: 0,
      uploadKps: 0,
      latencyMs: 0,
    },
    // https://github.com/ChromeDevTools/devtools-frontend/blob/4f404fa8beab837367e49f68e29da427361b1f81/front_end/sdk/NetworkManager.js#L251-L265
    {
      type: 'Preset',
      title: 'Slow 3G',
      downloadKps: 400,
      uploadKps: 400,
      latencyMs: 2000,
    },
    {
      type: 'Preset',
      title: 'Fast 3G',
      downloadKps: 1475,
      uploadKps: 675,
      latencyMs: 563,
    },
  ];
}

function _getDefaultNetworkProxyProfile() {
  return {
    active: false,
    default: {protocol: 'direct'},
    http: {useDefault: true},
    https: {useDefault: true},
    ftp: {useDefault: true},
    bypassList: ['127.0.0.1', '::1', 'localhost'],
  };
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
    PERMISSION_MANAGEMENT_OPTIONS.ASK_ALWAYS;
  settings.set(USER_PREFERENCES, userPreferences);
};

export default {migrateDeviceSchema};
