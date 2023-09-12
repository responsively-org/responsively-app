/**
 * Bitmap class to create image bitmaps
 */
import { nativeImage } from 'electron';
import { writeBufferToFile } from '../fileUtils';
import { BitmapData, COLOR } from './types';

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

  public async writeFile(filePath: string) {
    const electronImage = nativeImage.createFromBuffer(this.data, {
      width: this.width,
      height: this.height,
    });
    await writeBufferToFile(filePath, electronImage.toJPEG(90));
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
      if (!data) {
        this.fillData(
          bitmapOptions.color || TRANSPARENT_BLACK,
          0,
          0,
          width,
          height
        );
      }
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

    // copy first line into other places
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
