import { JpegData, JpegUtils } from './jpeg';
import { Bitmap } from './bitmap';

export class MergeImages {
  images: Buffer[];

  constructor(images: Buffer[]) {
    this.images = images;
  }

  public merge(): Bitmap {
    const decodedImages = this.decodeImages();
    const finalHeight = decodedImages.reduce((prevVal, currVal) => {
      return Math.max(prevVal, currVal.height);
    }, 0);
    const finalWidth = decodedImages.reduce((prevVal, currVal) => {
      return prevVal + currVal.width + 20;
    }, 20);
    const offsets: number[] = [];
    decodedImages.forEach((image, index) => {
      if (index === 0) {
        offsets.push(0);
      } else {
        offsets.push(offsets[index - 1] + decodedImages[index - 1].width * 4);
      }
    });
    const sharedImageBuffer = new ArrayBuffer(finalHeight * finalWidth * 4);
    const mergedBitmap = new Bitmap({
      data: sharedImageBuffer,
      width: finalWidth,
      height: finalHeight,
    });
    for (let i = 0; i < decodedImages.length; i += 1) {
      const decodedImage = decodedImages[i];
      const { data, width } = decodedImage;

      mergedBitmap.drawImage(data, offsets[i] + i * 20 * 4, width * 4);
    }

    return mergedBitmap;
  }

  private decodeImages(): JpegData[] {
    const decodedImages = this.images.map((image) => {
      return JpegUtils.decode(image);
    });

    return decodedImages;
  }
}
