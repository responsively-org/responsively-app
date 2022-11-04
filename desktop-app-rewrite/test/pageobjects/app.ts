import { ElectronApplication, expect, Locator, Page } from '@playwright/test';
import { DeviceObject } from './device';

export class AppPageObject {
  readonly page: Page;
  readonly electronApp: ElectronApplication;
  constructor(page: Page, electronApp: ElectronApplication) {
    this.page = page;
    this.electronApp = electronApp;
  }

  async goto(url) {
    console.log('Typing url', url);
    await this.page.locator('.address-input').first().fill(url);
    console.log('Typing url ...Done');
    console.log('Pressing enter');
    await this.page.locator('.address-input').first().press('Enter');
    console.log('Pressing enter ...Done');
  }

  async close() {
    return await this.electronApp.close();
  }

  async getDevices() {
    return await this.page
      .mainFrame()
      .childFrames()
      .map((frame) => new DeviceObject(frame));
  }

  async getFirstDevice() {
    const devices = await this.getDevices();
    return devices[0];
  }
}
