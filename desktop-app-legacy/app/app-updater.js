import {autoUpdater} from 'electron-updater';
import log from 'electron-log';
import {getPackageJson} from './utils/generalUtils';
import {shell, Notification} from 'electron';

const {EventEmitter} = require('events');

const AppUpdaterStatus = {
  Idle: 'idle',
  Checking: 'checking',
  NoUpdate: 'noUpdate',
  NewVersion: 'newVersion',
  Downloading: 'downloading',
  Downloaded: 'downloaded',
};

Object.freeze(AppUpdaterStatus);

class AppUpdater extends EventEmitter {
  status: string;

  timerId = null;

  isPortableVersion =
    process.env.PORTABLE_EXECUTABLE_DIR != null &&
    process.env.PORTABLE_EXECUTABLE_DIR.length !== 0;

  constructor() {
    super();
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.autoDownload = !this.isPortableVersion;
    this.status = AppUpdaterStatus.Idle;

    autoUpdater.on('checking-for-update', () =>
      this.handleStatusChange(AppUpdaterStatus.Checking, false)
    );
    autoUpdater.on('update-not-available', () =>
      this.handleStatusChange(AppUpdaterStatus.NoUpdate, true)
    );
    autoUpdater.on('download-progress', () =>
      this.handleStatusChange(AppUpdaterStatus.Downloading, false)
    );
    autoUpdater.on('update-downloaded', () =>
      this.handleStatusChange(AppUpdaterStatus.Downloaded, true)
    );
  }

  getCurrentStatus() {
    return this.status;
  }

  checkForUpdatesAndNotify() {
    const pkg = getPackageJson();
    if (this.status === AppUpdaterStatus.Idle) {
      if (this.isPortableVersion) {
        return autoUpdater.checkForUpdates().then(r => {
          if (
            r?.updateInfo?.version != null &&
            r.updateInfo.version !== pkg.version
          ) {
            this.handleStatusChange(AppUpdaterStatus.NewVersion, true);
            if (Notification.isSupported()) {
              const notif = new Notification({
                title: `New version ${r.updateInfo.version} available`,
                body:
                  'You have an outdated version of Responsively. Click here to download the latest version',
              });
              notif.on('click', () => {
                shell.openExternal(
                  'https://github.com/responsively-org/responsively-app/releases/latest'
                );
              });
              notif.show();
            }
          }
          return r;
        });
      }
      return autoUpdater.checkForUpdatesAndNotify();
    }
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
export {AppUpdaterStatus, appUpdaterInstance as appUpdater};
