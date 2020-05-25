import settings from 'electron-settings';
import path from 'path';

const HOME_PAGE = 'HOME_PAGE';

export function saveHomepage(url) {
  settings.set(HOME_PAGE, url);
}

export function getHomepage() {
  return settings.get(HOME_PAGE) || 'https://www.google.com/';
}
