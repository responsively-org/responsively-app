import {app} from 'electron';
import {autoUpdater} from 'electron-updater';
import log from './logging';

export interface AppUpdaterStatus {
  status: string;
  version?: string;
  lastChecked?: number;
  progress?: number;
  size?: number;
  error?: Error;
}

export class AppUpdater {
  status = 'IDLE';

  version?: string;

  lastChecked?: number;

  progress?: number;

  size?: number;

  error?: Error;

  constructor() {
    autoUpdater.logger = log;
    // electron-updater can't update unpacked (dev) builds and only logs
    // "Skip checkForUpdates" noise there, so don't even start the check.
    if (process.env.CI || process.env.E2E_TEST || !app.isPackaged) {
      return;
    }
    autoUpdater.checkForUpdatesAndNotify().catch((error) => {
      this.status = 'ERROR';
      this.error = error;
      this.lastChecked = Date.now();
      log.error('Update check failed', error);
    });
    autoUpdater.on('checking-for-update', () => {
      this.status = 'CHECKING';
      this.lastChecked = Date.now();
    });
    autoUpdater.on('update-available', (info) => {
      this.status = 'AVAILABLE';
      this.version = info.version;
      this.lastChecked = Date.now();
    });
    autoUpdater.on('update-not-available', (_info) => {
      this.status = 'UP_TO_DATE';
      this.lastChecked = Date.now();
    });
    autoUpdater.on('error', (err) => {
      this.status = 'ERROR';
      this.error = err;
      this.lastChecked = Date.now();
    });
    autoUpdater.on('download-progress', (progressObj) => {
      log.debug(
        `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
      );
      this.status = `DOWNLOADING - ${progressObj.percent}%`;
      this.progress = progressObj.percent;
      this.size = progressObj.total;
      this.lastChecked = Date.now();
    });
    autoUpdater.on('update-downloaded', (_info) => {
      this.status = 'DOWNLOADED (Restart to apply update)';
      this.lastChecked = Date.now();
    });
  }

  getStatus(): AppUpdaterStatus {
    return {
      status: this.status,
      version: this.version,
      lastChecked: this.lastChecked,
      progress: this.progress,
      size: this.size,
      error: this.error,
    };
  }
}
