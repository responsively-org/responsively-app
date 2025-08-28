/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { app } from 'electron';
import fs from 'fs-extra';
import os from 'os';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

let isCliArgResult: boolean | undefined;

export function isValidCliArgURL(arg?: string): boolean {
  if (isCliArgResult !== undefined) {
    return isCliArgResult;
  }
  if (arg == null || arg === '') {
    isCliArgResult = false;
    return false;
  }
  try {
    const url = new URL(arg);
    if (
      url.protocol === 'http:' ||
      url.protocol === 'https:' ||
      url.protocol === 'file:'
    ) {
      isCliArgResult = true;
      return true;
    }
    // eslint-disable-next-line no-console
    console.warn('Protocol not supported', url.protocol);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Not a valid URL', arg, e);
  }
  isCliArgResult = false;
  return false;
}

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

export interface EnvironmentInfo {
  appVersion: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  v8Version: string;
  osInfo: string;
}

export const getEnvironmentInfo = (): EnvironmentInfo => {
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
