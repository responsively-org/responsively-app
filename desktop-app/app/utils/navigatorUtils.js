import settings from 'electron-settings';

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
  return settings.get(LAST_OPENED_ADDRESS) || getHomepage();
}
