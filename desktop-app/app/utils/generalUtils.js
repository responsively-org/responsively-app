import {app} from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import isRenderer from 'is-electron-renderer';

const getPackageJson = () => {
  let appPath;
  if (process.env.NODE_ENV === 'production') appPath = app.getAppPath();
  else if (isRenderer) appPath = path.join(__dirname, '..');
  else appPath = path.join(__dirname, '..', '..');

  const pkgContent = fs.readFileSync(path.join(appPath, 'package.json'));
  return JSON.parse(pkgContent);
};

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
