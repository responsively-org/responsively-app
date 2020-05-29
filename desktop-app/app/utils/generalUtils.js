import {app} from 'electron';

const path = require('path');
const fs = require('fs')

const emailRE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function validateEmail(email) {
  return emailRE.test(String(email).toLowerCase());
}

export function getPackageJson() {
  const appPath = process.env.NODE_ENV === 'production' ? app.getAppPath() : path.join(__dirname, '..', '..');
  const pkgContent = fs.readFileSync(path.join(appPath, 'package.json'));
  return JSON.parse(pkgContent);
}

const pkg = getPackageJson();
export { pkg };
