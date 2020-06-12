import {autoUpdater} from 'electron-updater';
import log from 'electron-log';
import {pkg} from './utils/generalUtils';

const EventEmitter = require('events').EventEmitter; 

const AppUpdaterState = {
  Idle: 'idle',
  Checking: 'checking',
  NoUpdate: 'noUpdate',
  Downloading: 'downloading',
  Downloaded: 'downloaded',
}

Object.freeze(AppUpdaterState);

class AppUpdater extends EventEmitter {
  state: AppUpdaterState; 

  readyStates: AppUpdaterState[];

  constructor() {
    super();
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    this.state = AppUpdaterState.Idle;
    this.readyStates = [AppUpdaterState.Idle, AppUpdaterState.NoUpdate, AppUpdaterState.Downloaded];

    autoUpdater.on('checking-for-update',  () => this.handleStatusChange(AppUpdaterState.Checking));
    autoUpdater.on('update-not-available', () => this.handleStatusChange(AppUpdaterState.NoUpdate));
    autoUpdater.on('download-progress', () => this.handleStatusChange(AppUpdaterState.Downloading));
    autoUpdater.on('update-downloaded', () => this.handleStatusChange(AppUpdaterState.Downloaded));
  }

  getCurrentState() {
    return this.state;
  }

  readyToCheck() {
    return this.readyStates.includes(this.state);
  }

  checkForUpdatesAndNotify() {
    if (this.readyToCheck())
      return autoUpdater.checkForUpdatesAndNotify();
  } 

  handleStatusChange(nextStatus: AppUpdaterState) {
    const changed = this.state !== nextStatus;
    this.state = nextStatus;
    if (changed)
      this.emit('status-changed', nextStatus);
  }
  }

const appUpdaterInstance = new AppUpdater();
export { AppUpdaterState, appUpdaterInstance as appUpdater };