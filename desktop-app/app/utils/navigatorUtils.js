import settings from 'electron-settings';
import path from 'path';
import {STARTUP_PAGE} from '../constants/values';
import {USER_PREFERENCES} from '../constants/settingKeys';

const HOME_PAGE = 'HOME_PAGE';
const LAST_OPENED_ADDRESS = 'LAST_OPENED_ADDRESS';

export function saveHomepage(url) {
  settings.set(HOME_PAGE, url);
}

export function saveLastOpenedAddress(url) {
  settings.set(LAST_OPENED_ADDRESS, url);
}

export function getHomepage() {
  return settings.get(HOME_PAGE) || 'https://www.google.com/';
}

export function getLastOpenedAddress() {
  return settings.get(LAST_OPENED_ADDRESS) || getStartupPage();
}

export function getStartupPage() {
  const startupPage = settings.get(USER_PREFERENCES).startupPage;
  if (startupPage === STARTUP_PAGE.BLANK) return 'about:blank';
  return getHomepage();
}

export function saveStartupPage(option: 'BLANK' | 'HOME') {
  const preferences = settings.get(USER_PREFERENCES);
  preferences.startupPage = option;
  settings.set(USER_PREFERENCES, preferences);
}
