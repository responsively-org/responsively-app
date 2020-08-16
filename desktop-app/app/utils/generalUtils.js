import {app} from 'electron';
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

export const pkg = getPackageJson();

export default {pkg};
