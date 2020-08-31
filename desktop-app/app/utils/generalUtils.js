import {app} from 'electron';
import path from 'path';
import fs from 'fs';

const os = require('os');

function getPackageJson() {
  const appPath =
    process.env.NODE_ENV === 'production'
      ? app.getAppPath()
      : path.join(document.location.pathname, '..', '..');
  const pkgContent = fs.readFileSync(path.join(appPath, 'package.json'));
  return JSON.parse(pkgContent);
}

export const pkg = getPackageJson();

export const getEnvironmentInfo = () => {
  const appVersion = pkg.version || 'Unknown';
  const electronVersion = process.versions.electron || 'Unknown';
  const chromeVersion = process.versions.chrome || 'Unknown';
  const nodeVersion = process.versions.node || 'Unknown';
  const v8Version = process.versions.v8 || 'Unknown';
  const osInfo =
    `${os.type()} ${os.arch()} ${os.release()}`.trim() || 'Unknown';

  return {
    appVersion,
    electronVersion,
    chromeVersion,
    nodeVersion,
    v8Version,
    osInfo,
  };
};
