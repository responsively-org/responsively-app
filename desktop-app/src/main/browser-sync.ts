/* eslint-disable @typescript-eslint/ban-ts-comment */
import BrowserSync, {BrowserSyncInstance} from 'browser-sync';
import fs from 'fs-extra';

const DEFAULT_BROWSER_SYNC_PORT = 12719;

// Each instance picks a unique port to allow parallel E2E runs
const resolvedPort: number =
  process.env.E2E_TEST === 'true'
    ? DEFAULT_BROWSER_SYNC_PORT + Math.floor(Math.random() * 10000)
    : DEFAULT_BROWSER_SYNC_PORT;

export function getBrowserSyncPort(): number {
  return resolvedPort;
}

export function getBrowserSyncHost(): string {
  return `localhost:${resolvedPort}`;
}

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
        port: resolvedPort,
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
