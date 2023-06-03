import { Device } from '../deviceList';

export interface ImageBufferData {
  data: Buffer;
  height: number;
  width: number;
}

export interface ScreenshotArgs {
  webContentsId: number;
  fullPage?: boolean;
  device: Device;
}

export interface ScreenshotResult {
  done: boolean;
  image: ImageBufferData | undefined;
}

export interface FormData {
  captureEachImage: boolean;
  mergeImages: boolean;
  prefix: string;
}

export interface ScreenshotAllArgs {
  webContentsId: number;
  device: Device;
  previousHeight: string;
  previousTransform: string;
  pageHeight: number;
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

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

export type COLOR = RGBA;

export type EventData = FormData & { screens: Array<ScreenshotAllArgs> };
