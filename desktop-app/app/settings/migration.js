import settings from 'electron-settings';
import {ACTIVE_DEVICES, USER_PREFERENCES} from '../constants/settingKeys';

export function migrateDeviceSchema() {
  if (settings.get('USER_PREFERENCES')) {
    settings.set(USER_PREFERENCES, settings.get('USER_PREFERENCES'));
    settings.delete('USER_PREFERENCES');
  }
  const activeDevices = settings.get(ACTIVE_DEVICES);
  if (!activeDevices || !activeDevices.length || !activeDevices[0].width) {
    return;
  }
  settings.set(
    ACTIVE_DEVICES,
    activeDevices.map(device => device.name)
  );
}

export default {migrateDeviceSchema};
