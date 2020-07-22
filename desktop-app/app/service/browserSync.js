import {ipcRenderer} from 'electron';
import browserSync from 'browser-sync';

let browserSyncOptions;

initializeBrowserSyncOptions();

async function initializeBrowserSyncOptions() {
  if (!browserSyncOptions) {
    browserSyncOptions = await ipcRenderer.invoke('request-browser-sync');
  }
}

export function getBrowserSyncEmbedScriptURL() {
  if (browserSyncOptions) {
    return browserSyncOptions.url;
  }
}
