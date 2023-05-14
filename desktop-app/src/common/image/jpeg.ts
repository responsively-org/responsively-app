import jpeg from 'jpeg-js';

export interface JpegData {
  data: Buffer;
  width: number;
  height: number;
}

export class JpegUtils {
  public static decode(data: Buffer): JpegData {
    return jpeg.decode(data);
  }

  public static encode(data: JpegData, quality: number): Buffer {
    return jpeg.encode(data, quality).data;
  }
}
