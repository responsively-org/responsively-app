// @flow

import fs from 'fs';
import path from 'path';
import DateUtils from './date-utils';
import {shell} from 'electron';
import {getWebSiteName} from './urlUtils';

class FileSystemUtils {
  userPath: string;
  defaultPath: string;
  date: Date;
  address: string;
  currentDir: string;

  constructor(path: string, defaultPath: string, date: Date, address: string) {
    this.userPath = path;
    this.defaultPath = defaultPath;
    this.date = date;
    this.address = address;
    this.createFolder();
  }

  ensureDirExists(dir): boolean {
    return fs.existsSync(dir);
  }

  createFileNameFromAddress(): string {
    const dateUtils = new DateUtils(this.date);
    let fileName = getWebSiteName(this.address);
    const fileBaseName = base.replace(/\//g, '-');
    const dateString = dateUtils.getDateString();
    fileName += `-${fileBaseName}`;
    fileName += `-${dateString}`;

    return fileName;
  }

  createFolderNameFromDate(): string {
    const dateUtils = new DateUtils(this.date);
    const timeString = dateUtils.getTimeString();
    const dateString = dateUtils.getDateString();
    const dir = `${dateString} at ${timeString}/`;
    return path.join(this.userPath || this.defaultPath, dir);
  }

  // create a new folder
  createFolder() {
    this.currentDir = this.createFolderNameFromDate();

    if (!this.ensureDirExists(this.currentDir)) {
      fs.mkdirSync(this.currentDir);
    }
  }

  // save image to file
  async writeImageToFile(image: Buffer, deviceName: string, ext: string) {
    try {
      const fileName = this.createNewFileName(deviceName);
      const fileWithExt = `${fileName}.${ext}`;
      await fs.writeFileSync(path.join(this.currentDir, fileWithExt), image);
    } catch (err) {
      console.log(err);
    }
  }

  async writeBase64Data(image: string, deviceName: string, ext: string) {
    const fileName = this.createNewFileName(deviceName);
    const fileWithExt = `${fileName}.${ext}`;
    const data = image.replace(/^data:image\/png;base64,/, '');
    await fs.writeFileSync(
      path.join(this.currentDir, fileWithExt),
      data,
      'base64'
    );
  }

  /**
   * base is generally device name it can take urls
   * @param base:string
   * @returns {string}
   */
  createNewFileName(base: string): string {
    const dateUtils = new DateUtils(this.date);
    let fileName = getWebSiteName(this.address);
    // eslint-disable-next-line no-useless-escape
    const fileBaseName = base.replace(/[\/"]/g, '-');
    const dateString = dateUtils.getDateString();
    fileName += `-${fileBaseName}`;
    fileName += `-${dateString}`;

    return fileName;
  }

  async openCurrentDir() {
    if (!this.currentDir) return;
    await shell.openPath(path.join(this.currentDir));
    shell.beep();
  }
}

export default FileSystemUtils;
