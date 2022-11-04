import { Frame } from '@playwright/test';

export class DeviceObject {
  readonly frame: Frame;
  constructor(frame: Frame) {
    this.frame = frame;
  }

  async getURL() {
    console.log('Getting URL', await await this.frame.$('html'));
    return await this.frame.url();
  }

  async getTitle() {
    return await this.frame.title();
  }
}
