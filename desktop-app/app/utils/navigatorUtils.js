import settings from 'electron-settings';
import {userPreferenceSettings} from '../settings/userPreferenceSettings';
import {START_MANAGEMENT_OPTIONS} from '../constants/startPageManagement';
import path from 'path';

const HOME_PAGE = 'HOME_PAGE';
const LAST_OPENED_ADDRESS = 'LAST_OPENED_ADDRESS';

export function saveHomepage(url) {
  settings.set(HOME_PAGE, url);
}

export function saveLastOpenedAddress(url) {
  settings.set(LAST_OPENED_ADDRESS, url);
}

export function getHomepage() {
  return userPreferenceSettings.getDefaultStartPage() ===
    START_MANAGEMENT_OPTIONS.HOME
    ? settings.get(HOME_PAGE) || 'https://www.google.com/'
    : 'about:blank';
}

export function getLastOpenedAddress() {
  return settings.get(LAST_OPENED_ADDRESS) || getHomepage();
}
