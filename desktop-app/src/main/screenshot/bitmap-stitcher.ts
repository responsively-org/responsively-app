import {nativeImage} from 'electron';

export class BitmapStitcher {
  private result: Buffer | undefined;

  private width = 0;

  private height = 0;

  private pixelsPerCssPixel = 1;

  constructor(
    private readonly documentHeight: number,
    private readonly viewportHeight: number
  ) {}

  append(tile: Electron.NativeImage, cssY: number) {
    const {width, height} = tile.getSize();
    if (this.result === undefined) {
      this.pixelsPerCssPixel = height / this.viewportHeight;
      this.width = width;
      this.height = Math.ceil(this.documentHeight * this.pixelsPerCssPixel);
      this.result = Buffer.alloc(this.width * this.height * 4);
    }

    const tileBitmap = tile.toBitmap();
    const destinationY = Math.round(cssY * this.pixelsPerCssPixel);
    const rowsToCopy = Math.min(height, this.height - destinationY);
    const rowBytes = this.width * 4;
    for (let row = 0; row < rowsToCopy; row += 1) {
      const sourceStart = row * rowBytes;
      tileBitmap.copy(
        this.result,
        (destinationY + row) * rowBytes,
        sourceStart,
        sourceStart + rowBytes
      );
    }
  }

  toImage() {
    return this.result === undefined
      ? undefined
      : nativeImage.createFromBitmap(this.result, {width: this.width, height: this.height});
  }
}
