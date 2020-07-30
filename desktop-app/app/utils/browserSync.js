const browserSync = require('browser-sync').create();

import {BROWSER_SYNC_VERSION} from '../constants/browserSync';

export async function initBrowserSync() {
  if (!browserSync.active) {
    await initInstance();
  }
}

export function getBrowserSyncHost() {
  return `localhost:${browserSync.getOption('port')}`;
}

export function getBrowserSyncEmbedScriptURL() {
  return `https://${getBrowserSyncHost()}/browser-sync/browser-sync-client.js?v=${BROWSER_SYNC_VERSION}`;
}

async function initInstance(): Promise<> {
  return new Promise((resolve, reject) => {
    browserSync.init(
      {
        open: false,
        localOnly: true,
        https: true,
        notify: false,
        ui: false,
      },
      (err, bs) => {
        if (err) {
          return reject(err);
        }
        resolve(bs);
      }
    );
  });
}

export function closeBrowserSync() {
  browserSync.cleanup();
  browserSync.exit();
}
