import { Bitmap } from './bitmap';
import { ImageBufferData } from './types';

export class MergeImages {
  images: ImageBufferData[];

  constructor(images: ImageBufferData[]) {
    this.images = images;
  }

  public merge(): Bitmap {
    // const decodedImages = this.decodeImages();
    const finalHeight = this.images.reduce((prevVal, currVal) => {
      return Math.max(prevVal, currVal.height);
    }, 0);
    const finalWidth = this.images.reduce((prevVal, currVal) => {
      return prevVal + currVal.width + 20;
    }, 20);
    const offsets: number[] = [];
    this.images.forEach((_, index) => {
      if (index === 0) {
        offsets.push(0);
      } else {
        offsets.push(offsets[index - 1] + this.images[index - 1].width * 4);
      }
    });
    const mergedBitmap = new Bitmap({
      width: finalWidth,
      height: finalHeight,
    });
    for (let i = 0; i < this.images.length; i += 1) {
      const decodedImage = this.images[i];
      const { data, width } = decodedImage;

      mergedBitmap.drawImage(data, offsets[i] + i * 20 * 4, width * 4);
    }

    return mergedBitmap;
  }
}
