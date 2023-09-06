/* eslint-disable @typescript-eslint/ban-ts-comment */
import BrowserSync, { BrowserSyncInstance } from 'browser-sync';
import fs from 'fs-extra';

export const BROWSER_SYNC_PORT = 12719;
export const BROWSER_SYNC_HOST = `localhost:${BROWSER_SYNC_PORT}`;
export const BROWSER_SYNC_URL = `https://${BROWSER_SYNC_HOST}/browser-sync/browser-sync-client.js?v=2.27.10`;

const browserSyncEmbed: BrowserSyncInstance = BrowserSync.create('embed');

let created = false;
let filesWatcher: ReturnType<BrowserSyncInstance['watch']> | null = null;
let cssWatcher: ReturnType<BrowserSyncInstance['watch']> | null = null;

export async function initInstance(): Promise<BrowserSyncInstance> {
  if (created) {
    return browserSyncEmbed;
  }
  created = true;
  return new Promise((resolve, reject) => {
    browserSyncEmbed.init(
      {
        open: false,
        localOnly: true,
        https: true,
        notify: false,
        ui: false,
        port: BROWSER_SYNC_PORT,
      },
      (err: Error, bs: BrowserSyncInstance) => {
        if (err) {
          return reject(err);
        }
        return resolve(bs);
      }
    );
  });
}

export function watchFiles(filePath: string) {
  if (filePath && fs.existsSync(filePath)) {
    const fileDir = filePath.substring(0, filePath.lastIndexOf('/'));

    filesWatcher = browserSyncEmbed
      // @ts-expect-error
      .watch([filePath, `${fileDir}/**/**.js`])
      .on('change', browserSyncEmbed.reload);

    cssWatcher = browserSyncEmbed.watch(
      `${fileDir}/**/**.css`,
      // @ts-expect-error
      (event: string, file: string) => {
        if (event === 'change') {
          browserSyncEmbed.reload(file);
        }
      }
    );
  }
}

export async function stopWatchFiles() {
  if (filesWatcher) {
    // @ts-expect-error
    await filesWatcher.close();
  }
  if (cssWatcher) {
    // @ts-expect-error
    await cssWatcher.close();
  }
}
