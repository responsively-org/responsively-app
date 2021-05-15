export function convertNativeImageToPNG(image: Electron.NativeImage) {
  return image.toPNG();
}
