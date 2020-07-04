import {autoUpdater} from 'electron-updater';
import log from 'electron-log';

const {EventEmitter} = require('events'); 

const AppUpdaterStatus = {
  Idle: 'idle',
  Checking: 'checking',
  NoUpdate: 'noUpdate',
  Downloading: 'downloading',
  Downloaded: 'downloaded',
}

Object.freeze(AppUpdaterStatus);

class AppUpdater extends EventEmitter {
  status: string; 

  timerId = null;

  constructor() {
    super();
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    this.status = AppUpdaterStatus.Idle;

    autoUpdater.on('checking-for-update',  () => this.handleStatusChange(AppUpdaterStatus.Checking, false));
    autoUpdater.on('update-not-available', () => this.handleStatusChange(AppUpdaterStatus.NoUpdate, true));
    autoUpdater.on('download-progress', () => this.handleStatusChange(AppUpdaterStatus.Downloading, false));
    autoUpdater.on('update-downloaded', () => this.handleStatusChange(AppUpdaterStatus.Downloaded, true));
  }

  getCurrentStatus() {
    return this.status;
  }

  checkForUpdatesAndNotify() {
    if (this.status === AppUpdaterStatus.Idle)
      return autoUpdater.checkForUpdatesAndNotify();
  } 

  handleStatusChange(nextStatus: string, backToIdle: boolean) {
    clearTimeout(this.timerId);
    
    if (this.status !== nextStatus) {
      this.status = nextStatus;
      this.emit('status-changed', nextStatus);

      if (backToIdle) {
        this.timerId = setTimeout(() => {
            if (this.status !== AppUpdaterStatus.Idle) {
              this.status = AppUpdaterStatus.Idle;
              this.emit('status-changed', AppUpdaterStatus.Idle);
            }
        }, 2000);
      }
    }
  }
}

const appUpdaterInstance = new AppUpdater();
export { AppUpdaterStatus, appUpdaterInstance as appUpdater };