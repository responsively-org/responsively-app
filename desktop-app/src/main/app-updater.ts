import { autoUpdater } from 'electron-updater';

export interface AppUpdaterStatus {
  status: string;
  version?: string;
  lastChecked?: number;
  progress?: number;
  size?: number;
  error?: Error;
}

export class AppUpdater {
  status: string = 'IDLE';

  version?: string;

  lastChecked?: number;

  progress?: number;

  size?: number;

  error?: Error;

  constructor() {
    autoUpdater.logger = console;
    autoUpdater.checkForUpdatesAndNotify();
    autoUpdater.on('checking-for-update', () => {
      this.status = 'CHECKING';
      this.lastChecked = Date.now();
    });
    autoUpdater.on('update-available', (info) => {
      this.status = 'AVAILABLE';
      this.version = info.version;
      this.lastChecked = Date.now();
    });
    autoUpdater.on('update-not-available', (info) => {
      this.status = 'UP_TO_DATE';
      this.lastChecked = Date.now();
    });
    autoUpdater.on('error', (err) => {
      this.status = 'ERROR';
      this.error = err;
      this.lastChecked = Date.now();
    });
    autoUpdater.on('download-progress', (progressObj) => {
      const logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
      // eslint-disable-next-line no-console
      console.log(logMessage);
      this.status = `DOWNLOADING - ${progressObj.percent}%`;
      this.progress = progressObj.percent;
      this.size = progressObj.total;
      this.lastChecked = Date.now();
    });
    autoUpdater.on('update-downloaded', (info) => {
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
