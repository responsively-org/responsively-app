const browserSyncEmbed = require('browser-sync').create('embed');

import {BROWSER_SYNC_VERSION} from '../constants/browserSync';
import fs from 'fs';

let filesWatcher;
let cssWatcher;
export async function initBrowserSync() {
  if (!browserSyncEmbed.active) {
    await initInstance();
  }
}

export function watchFiles(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    const fileDir = filePath.substring(0, filePath.lastIndexOf('/'));
    filesWatcher = browserSyncEmbed
      .watch([filePath, `${fileDir}/**/**.js`])
      .on('change', browserSyncEmbed.reload);

    cssWatcher = browserSyncEmbed.watch(
      `${fileDir}/**/**.css`,
      (event, file) => {
        if (event === 'change') {
          browserSyncEmbed.reload(file);
        }
      }
    );
  }
}

export function stopWatchFiles() {
  if (filesWatcher) {
    filesWatcher.close();
  }
  if (cssWatcher) {
    cssWatcher.close();
  }
}

export function getBrowserSyncHost() {
  return `localhost:${browserSyncEmbed.getOption('port')}`;
}

export function getBrowserSyncEmbedScriptURL() {
  return `https://${getBrowserSyncHost()}/browser-sync/browser-sync-client.js?v=${BROWSER_SYNC_VERSION}`;
}

async function initInstance(): Promise<> {
  return new Promise((resolve, reject) => {
    browserSyncEmbed.init(
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
  browserSyncEmbed.exit();
}
