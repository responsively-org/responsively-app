import {ipcRenderer} from 'electron';
import browserSync from 'browser-sync';

let browserSyncOptions;

initializeBrowserSyncOptions();

async function initializeBrowserSyncOptions() {
  console.log('requesting browser sync');
  if (!browserSyncOptions) {
    browserSyncOptions = await ipcRenderer.invoke('request-browser-sync');
  }
}

export function getBrowserSyncEmbedScriptURL() {
  if (browserSyncOptions) {
    return browserSyncOptions.url;
  }
}
