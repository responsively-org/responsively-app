import pubsub from 'pubsub.js';
import {ipcRenderer} from 'electron';
import {
  HIDE_PERMISSION_POPUP_DUE_TO_RELOAD,
  PERMISSION_MANAGEMENT_PREFERENCE_CHANGED,
} from '../constants/pubsubEvents';
import {PERMISSION_MANAGEMENT_OPTIONS} from '../constants/permissionsManagement';
import {USER_PREFERENCES} from '../constants/settingKeys';
import settings from 'electron-settings';

const path = require('path');

export function getPermissionPageTitle(url) {
  if (url == null || url.length === 0) return 'The webpage';
  try {
    if (url.startsWith('file://')) {
      return decodeURIComponent(path.basename(url));
    }
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function getDeviceText(device) {
  if (device === 'audio') return 'microphone';
  if (device === 'video') return 'camera';
  return device;
}

// simulating the behavior of google chrome
export function getPermissionRequestMessage(permission, details) {
  if (permission === 'notifications') return 'wants to show notifications';

  if (permission === 'geolocation') return 'wants to know your location';

  if (permission === 'fullscreen') return 'wants to go to full screen';

  if (permission === 'pointerLock')
    return 'wants to control your pointer movements';

  //  see https:github.com/electron/electron/pull/23333
  if (permission.includes('clipboard') || permission === 'unknown')
    return 'wants to see text and images copied to the clipboard';

  if (permission === 'media') {
    let mediaTypes = details?.mediaTypes;
    if (mediaTypes != null && mediaTypes.length !== 0) {
      mediaTypes = mediaTypes.map(getDeviceText);
      if (mediaTypes.length === 1) return `wants to use your ${mediaTypes[0]}`;
      const last = mediaTypes.pop();
      return `wants to use your ${mediaTypes.join(', ')} and ${last}`;
    }
    return 'wants to use some of your media devices';
  }

  if (permission.includes('midi')) return 'wants to use your MIDI devices';

  return `is requesting permission for "${permission}"`;
}

export function notifyPermissionToHandleReloadOrNewAddress() {
  pubsub.publish(HIDE_PERMISSION_POPUP_DUE_TO_RELOAD);
  ipcRenderer.send('reset-ignored-permissions');
}

export function notifyPermissionPreferenceChanged(newPreference) {
  pubsub.publish(PERMISSION_MANAGEMENT_PREFERENCE_CHANGED, [newPreference]);
}

export function getPermissionSettingPreference() {
  return settings.get(USER_PREFERENCES)?.permissionManagement || PERMISSION_MANAGEMENT_OPTIONS.ALLOW_ALWAYS;
}
