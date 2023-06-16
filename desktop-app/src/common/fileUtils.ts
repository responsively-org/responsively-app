import { shell } from 'electron';
import { WriteStream, createWriteStream } from 'fs';
import { ensureDir } from 'fs-extra';
import { homedir } from 'os';
import path from 'path';

function write(stream: WriteStream, data: Buffer) {
  return new Promise((resolve, reject) => {
    try {
      stream.on('finish', () => {
        resolve('done');
      });
      stream.on('error', (error) => {
        reject(error);
      });
      stream.write(data);
      stream.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Used to write buffer data to a file
 *
 * @param filePath Path of the file
 * @param data Buffer data
 */
export async function writeBufferToFile(filePath: string, data: Buffer) {
  const stream = createWriteStream(filePath);
  await write(stream, data);
}

/**
 * Ensures screenshots directory exists and return the path of the file
 *
 * @param name name of the file
 * @returns file path
 */
export async function getResponsivelyScreenshotFilePath(
  name: string
): Promise<string> {
  const dir = path.join(homedir(), `Desktop/Responsively-Screenshots`);
  const filePath = path.join(dir, `/${name}-${Date.now()}.jpeg`);
  await ensureDir(dir);
  return filePath;
}

/**
 * Opens file in file explorer
 *
 * @param filePath path of the file
 */
export function openFinder(filePath: string) {
  setTimeout(() => shell.showItemInFolder(filePath));
}
