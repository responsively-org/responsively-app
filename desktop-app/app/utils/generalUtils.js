import {app} from 'electron';

const path = require('path');
const fs = require('fs');

export function getPackageJson() {
  const appPath =
    process.env.NODE_ENV === 'production'
      ? app.getAppPath()
      : path.join(__dirname, '..', '..');
  const pkgContent = fs.readFileSync(path.join(appPath, 'package.json'));
  return JSON.parse(pkgContent);
}

const pkg = getPackageJson();
export {pkg};
