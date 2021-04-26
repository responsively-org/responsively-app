import fs from 'fs-extra';
import path from 'path';
import DateUtils from './date-utils';
import {shell} from 'electron';

class FileSystemUtils {
  path: string;
  date: Date;
  address: string;
  device: string;

  constructor(path: string, date: Date, address: string, device: string) {
    this.path = path;
    this.date = date;
    this.address = address;
    this.device = device;
  }

  async writeImageToFile(image: Buffer, newDir: boolean, ext: string) {
    try {
      const dir = this.createNewDirectoryName(newDir);
      const fileName = this.createNewFileName(true);
      const ensureDirPromise = fs.ensureDir(dir);
      await ensureDirPromise;
      const fileWithExt = `${fileName}.${ext}`;
      await fs.writeFileSync(path.join(dir, fileWithExt), image);
    } catch (err) {
      console.log(err);
    }
  }

  async writeBitImageToFile(image: any, newDir: boolean) {
    try {
      const dir = this.createNewDirectoryName(newDir);
      const ensureDirPromise = fs.ensureDir(dir);
      await ensureDirPromise;
      const regex = /^data:.+\/(.+);base64,(.*)$/;
      const matches = image.match(regex);
      const ext = matches[1];
      const data = matches[2];
      const buffer = Buffer.from(data, 'base64');
      const fileWithExt = `merged-full.${ext}`;
      await fs.writeFileSync(path.join(dir, fileWithExt), buffer);
    } catch (err) {
      console.log(err);
    }
  }

  convertNativeImageToJPEG(image: Electron.NativeImage) {
    return image.toJPEG(100);
  }

  createNewDirectoryName(createNew: boolean) {
    const dateUtils = new DateUtils(this.date);
    const timeString = dateUtils.getTimeString();
    const dateString = dateUtils.getDateString();

    let dir = '';
    if (createNew) {
      dir = `${dateString} at ${timeString}/`;
    }

    return path.join(this.path, dir);
  }

  createNewFileName(createNew: boolean): string {
    const dateUtils = new DateUtils(this.date);
    let fileName = this.parseWebAddress(this.address);
    if (createNew) {
      fileName += '- Full - ';
    }
    const deviceName = this.device.replace(/\//g, '-');
    const dateString = dateUtils.getDateString();
    fileName += deviceName;
    fileName += dateString;

    return fileName;
  }

  parseWebAddress(address: string): string {
    let domain: string = '';
    if (address.startsWith('file://')) {
      const fileNameStartingIndex = address.lastIndexOf('/') + 1;
      let htmIndex = address.indexOf('.htm');
      if (htmIndex === -1) {
        htmIndex = address.length;
      }
      domain = address.substring(fileNameStartingIndex, htmIndex);
    } else {
      domain = new URL(address).hostname;
      domain = domain.replace('www.', '');
      const dotIndex = domain.indexOf('.');
      if (dotIndex > -1) {
        domain = domain.substr(0, domain.indexOf('.'));
      }
    }
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  }

  openCurrentDir(newDir: boolean) {
    const dir = this.createNewDirectoryName(newDir);
    shell.showItemInFolder(path.join(dir));
  }
}

export default FileSystemUtils;
