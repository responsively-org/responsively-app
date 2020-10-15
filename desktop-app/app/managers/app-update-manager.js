import {autoUpdater} from 'electron-updater';
import log from 'electron-log';
import {getPackageJson} from '../utils/generalUtils';
import {shell, Notification} from 'electron';
import {APP_UPDATER_STATUS} from '../constants/app-updater-status';

const {EventEmitter} = require('events');

class AppUpdateManager extends EventEmitter {
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
    this.status = APP_UPDATER_STATUS.Idle.id;

    autoUpdater.on('checking-for-update', () =>
      this.handleStatusChange(APP_UPDATER_STATUS.Checking.id, false)
    );
    autoUpdater.on('update-not-available', () =>
      this.handleStatusChange(APP_UPDATER_STATUS.NoUpdate.id, true)
    );
    autoUpdater.on('download-progress', () => {
      if (!this.isPortableVersion)
        this.handleStatusChange(APP_UPDATER_STATUS.Downloading.id, false);
    });
    autoUpdater.on('update-downloaded', () => {
      if (!this.isPortableVersion)
        this.handleStatusChange(APP_UPDATER_STATUS.Downloaded.id, true);
    });
  }

  getCurrentStatus() {
    return this.status;
  }

  checkForUpdatesAndNotify() {
    const pkg = getPackageJson();
    if (this.status === APP_UPDATER_STATUS.Idle.id) {
      if (this.isPortableVersion) {
        return autoUpdater.checkForUpdates().then(r => {
          if (
            r?.updateInfo?.version != null &&
            r.updateInfo.version !== pkg.version
          ) {
            this.handleStatusChange(APP_UPDATER_STATUS.NewVersion.id, true);
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
          if (this.status !== APP_UPDATER_STATUS.Idle.id) {
            this.status = APP_UPDATER_STATUS.Idle.id;
            this.emit('status-changed', APP_UPDATER_STATUS.Idle.id);
          }
        }, 2000);
      }
    }
  }
}

const instance = new AppUpdateManager();
export {instance as AppUpdateManager};
