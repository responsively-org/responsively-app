import {app} from 'electron';
import log from 'electron-log';

/**
 * Central logging + crash capture for the main process. File transport lands
 * in the platform log directory (~/Library/Logs/ResponsivelyApp on macOS), so
 * field issues finally leave a trace.
 */
export const initLogging = () => {
  log.transports.file.level = 'info';
  log.transports.console.level =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true' ? 'debug' : 'warn';
  // uncaughtException + unhandledRejection
  log.errorHandler.startCatching({showDialog: false});
};

export const initCrashHandlers = () => {
  app.on('render-process-gone', (_event, webContents, details) => {
    log.error('[crash] renderer process gone', {
      reason: details.reason,
      exitCode: details.exitCode,
      url: webContents.getURL(),
    });
  });
  app.on('child-process-gone', (_event, details) => {
    log.error('[crash] child process gone', {
      type: details.type,
      reason: details.reason,
      exitCode: details.exitCode,
    });
  });
};

export default log;
