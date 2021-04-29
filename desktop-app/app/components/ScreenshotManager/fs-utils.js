import fs from 'fs-extra';
import path from 'path';
import DateUtils from './date-utils';
import {shell} from 'electron';
import PromiseWorker from 'promise-worker';

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
  }

  // save image to file
  async writeImageToFile(
    image: Buffer,
    newDir: boolean,
    deviceName: string,
    ext: string
  ) {
    try {
      if (!this.currentDir) {
        this.createNewDirectoryName(newDir);
      }
      const fileName = this.createNewFileName(deviceName);
      const ensureDirPromise = fs.ensureDir(this.currentDir);
      await ensureDirPromise;
      const fileWithExt = `${fileName}.${ext}`;
      await fs.writeFileSync(path.join(this.currentDir, fileWithExt), image);
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * converts existing canvas URI string to buffer
   * It uses web worker so that it does not actually blocks render thread.
   * @param image : string
   * @returns {Promise<[Buffer, string]>} buffer gets returned along with extension (normally png)
   */
  convertToImageBuffer(image) {
    const worker = new Worker(
      path.join(__dirname, './components/ScreenshotManager/image-worker.js')
    );
    const promiseWorker = new PromiseWorker(worker);
    return promiseWorker.postMessage({mergedImg: image});
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
    this.currentDir = path.join(this.userPath || this.defaultPath, dir);
  }

  /**
   * base is generally device name it can take urls
   * @param base:string
   * @returns {string}
   */
  createNewFileName(base: string): string {
    const dateUtils = new DateUtils(this.date);
    let fileName = this.parseWebAddress(this.address);
    const fileBaseName = base.replace(/\//g, '-');
    const dateString = dateUtils.getDateString();
    fileName += `-${fileBaseName}`;
    fileName += `-${dateString}`;

    return fileName;
  }

  // TODO: duplicate code remove other one
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

  async openCurrentDir() {
    if (!this.currentDir) return;
    await shell.openPath(path.join(this.currentDir));
    shell.beep();
  }
}

export default FileSystemUtils;
