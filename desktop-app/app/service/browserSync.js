import {ipcRenderer} from 'electron';
import browserSync from 'browser-sync';

let browserSyncOptions;

if (!browserSyncOptions) {
  browserSyncOptions = ipcRenderer.sendSync('request-browser-sync');
}

export function getBrowserSyncEmbedScriptURL() {
  if (browserSyncOptions) {
    return browserSyncOptions.url;
  }
}
