import {app} from 'electron';
import * as Sentry from '@sentry/electron';
import path from 'path';
import fs from 'fs';

export function getPackageJson() {
  const appPath =
    process.env.NODE_ENV === 'production'
      ? app.getAppPath()
      : path.join(__dirname, '..', '..');
  const pkgContent = fs.readFileSync(path.join(appPath, 'package.json'));
  return JSON.parse(pkgContent);
}

const pkg = getPackageJson();

export const captureOnSentry = err => {
  console.log('err', err);
  Sentry.captureException(err);
};

export default {pkg};
