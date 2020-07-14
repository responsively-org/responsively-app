const browserSync = require('browser-sync');

import {
  BROWSER_SYNC_PORT,
  BROWSER_SYNC_VERSION,
} from '../constants/browserSync';

export function initBrowserSync() {
  browserSync.init({
    port: BROWSER_SYNC_PORT,
    open: false,
    localOnly: true,
    https: true,
    notify: false,
    ui: false,
  });
}
