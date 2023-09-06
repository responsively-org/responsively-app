import {app} from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import {SSL_ERROR_CODES} from '../constants/values';

export const getPackageJson = () => {
  let appPath;
  if (process.env.NODE_ENV === 'production') appPath = app.getAppPath();
  else appPath = process.cwd();

  const pkgPath = path.join(appPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkgContent = fs.readFileSync(pkgPath, 'utf-8');
    return JSON.parse(pkgContent);
  }
  console.error(`cant find package.json in: '${appPath}'`);
  return {};
};

export const getEnvironmentInfo = () => {
  const pkg = getPackageJson();
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

export function isSslValidationFailed(errorCode) {
  return (
    errorCode <= SSL_ERROR_CODES.FIRST && errorCode >= SSL_ERROR_CODES.LAST
  );
}
