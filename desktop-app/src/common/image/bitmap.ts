/**
 * Bitmap class to create image bitmaps
 */
import { WriteStream, createWriteStream } from 'fs';
import jpeg from 'jpeg-js';

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface FileOptions {
  quality: number;
  type: ImageType;
}

export type COLOR = RGBA;

export interface BitmapData {
  width?: number;
  height?: number;
  data?: ArrayBuffer;
  color?: COLOR;
}

export enum FileType {
  PNG = 'png',
  JPEG = 'jpeg',
  JPG = 'jpg',
}

export enum ImageType {
  PNG = 1,
  JPEG = 2,
}

export const TRANSPARENT_BLACK = { r: 0, g: 0, b: 0, a: 0 };

export class Bitmap {
  private width!: number;

  private height!: number;

  private data!: Buffer;

  constructor(bitmapData: BitmapData) {
    this.initData(bitmapData);
  }

  get Height() {
    return this.height;
  }

  get Width() {
    return this.width;
  }

  /**
   * JPEG data buffer
   *
   * @param data JPEG data
   */
  public decodeBuffer(data: Buffer) {
    const { width, height, data: bufferData } = jpeg.decode(data);
    this.width = width;
    this.height = height;
    this.data = bufferData;
  }

  public drawImage(
    imageBuffer: Buffer,
    startPosition: number,
    imgWidth: number
  ) {
    let sourceStart = 0;
    let sourceEnd = imgWidth;
    let targetStart = startPosition;
    const { length } = imageBuffer;
    const jump = this.width * 4;
    for (let i = 0; i < length; i += imgWidth) {
      imageBuffer.copy(this.data, targetStart, sourceStart, sourceEnd);
      targetStart += jump;
      sourceStart = sourceEnd;
      sourceEnd += imgWidth;
    }
  }

  public jpecEncode(quality: number): jpeg.BufferRet {
    return jpeg.encode(
      { data: this.data, width: this.width, height: this.height },
      quality
    );
  }

  public write(stream: WriteStream, options: FileOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        stream.on('finish', () => {
          resolve('done');
        });
        stream.on('error', (error) => {
          reject(error);
        });
        switch (options.type) {
          case ImageType.JPEG:
            stream.write(
              jpeg.encode(
                { data: this.data, width: this.width, height: this.height },
                options.quality || 90
              ).data
            );
            stream.end();
            break;
          case ImageType.PNG:
            break;
          default:
            break;
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  public async writeFile(filePath: string, quality: number) {
    const options = this.parseFileOptions(filePath, quality);
    const stream = createWriteStream(filePath);
    await this.write(stream, options);
  }

  private parseFileOptions(fileName: string, quality: number): FileOptions {
    const fileType = this.deduceFileType(fileName);
    const fileOptions: FileOptions = {
      quality: quality || 100,
      type: fileType,
    };
    return fileOptions;
  }

  /**
   * @param fileName {string} name of the file
   * @returns deduces file type from the file name
   */
  // eslint-disable-next-line class-methods-use-this
  private deduceFileType(fileName: string): ImageType {
    // check if valid fileName
    if (!fileName) {
      throw new Error('Invalid file name');
    }

    const fileExtension = fileName.split('.').pop();
    switch (fileExtension) {
      case FileType.JPEG:
        return ImageType.JPEG;
      case FileType.JPG:
        return ImageType.JPEG;
      case FileType.PNG:
        return ImageType.PNG;
      default:
        break;
    }
    // if non of extensions mathces
    throw new Error('Invalid file type');
  }

  /**
   * Creates a bitmap object for image manipulation
   *
   * @param bitmapOptions initial bitmap data
   */
  private initData(bitmapOptions: BitmapData) {
    const { width, height, data } = bitmapOptions;

    if (width && height) {
      this.width = width;
      this.height = height;
      this.data = data ? Buffer.from(data) : Buffer.alloc(width * height * 4);
      this.fillData(
        bitmapOptions.color || TRANSPARENT_BLACK,
        0,
        0,
        width,
        height
      );
    }
  }

  /**
   * fills a color in the bitmap
   *
   * @param color color to be filled in the bitmap
   * @param left position of the left side of the rectangle from where the fill starts
   * @param top position of the top side of the rectangle from where the fill starts
   * @param width upto which width the fill should happen
   * @param height upto which height the fill should happen
   */
  private fillData(
    color: COLOR,
    left: number,
    top: number,
    width: number,
    height: number
  ) {
    const leftPosition = left || 0;
    const topPosition = top || 0;
    const finalWidth = width || this.width - left;
    const finalHeight = height || this.height - top;

    // validate left and top
    if (leftPosition < 0 || leftPosition > this.width) {
      throw new Error('Invalid left position');
    }

    if (topPosition < 0 || topPosition > this.height) {
      throw new Error('Invalid top position');
    }

    // validate width and height
    if (finalWidth < 0 || finalWidth > this.width) {
      throw new Error('Invalid width');
    }

    if (finalHeight < 0 || finalHeight > this.height) {
      throw new Error('Invalid height');
    }

    const finalColor = color || TRANSPARENT_BLACK;
    const { r, g, b, a } = finalColor;
    const buf = this.data;
    const bottomPosition = topPosition + finalHeight;
    const rightPosition = leftPosition + finalWidth;

    // step 1: fille first scanline
    const positionFromBufferStarts =
      (topPosition * this.width + leftPosition) * 4;
    let currentPosition = positionFromBufferStarts;
    for (let i = leftPosition; i < rightPosition; i += 1) {
      buf[currentPosition] = r;
      buf[currentPosition + 1] = g;
      buf[currentPosition + 2] = b;
      buf[currentPosition + 3] = a;
      currentPosition += 4;
    }

    // copy that line into other places
    const positionFromBufferEnds = currentPosition;
    let positionFromCopyShouldstart = positionFromBufferEnds;
    for (let i = topPosition + 1; i < bottomPosition; i += 1) {
      buf.copy(
        buf,
        positionFromCopyShouldstart,
        positionFromBufferStarts,
        positionFromBufferEnds
      );
      positionFromCopyShouldstart +=
        positionFromBufferEnds - positionFromBufferStarts;
    }
  }
}
