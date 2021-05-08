import PromiseWorker from 'promise-worker';
import path from 'path';
/**
 * creates new web worker while converting data
 * this way electron main thread won't be blocked.
 *
 * @param image {string} DataURI of the image
 * @returns {Promise<Buffer>}
 */
export function convertURIImageToBuffer(image: string): Promise<Buffer> {
  const worker = new Worker(path.join(__dirname, './utils/image-worker.js'));
  const promiseWorker = new PromiseWorker(worker);
  return promiseWorker.postMessage({mergedImg: image});
}

export function convertNativeImageToJPEG(image: Electron.NativeImage) {
  return image.toJPEG(100);
}
