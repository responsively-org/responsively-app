import {ElectronApplication, Locator, Page} from '@playwright/test';

export class ResponsivelyApp {
  readonly page: Page;
  readonly electronApp: ElectronApplication;

  // Locators
  readonly addressBar: Locator;
  readonly backButton: Locator;
  readonly forwardButton: Locator;
  readonly refreshButton: Locator;
  readonly menuButton: Locator;
  readonly firstWebview: Locator;
  readonly webviews: Locator;

  constructor(page: Page, electronApp: ElectronApplication) {
    this.page = page;
    this.electronApp = electronApp;

    this.addressBar = page.locator('[data-testid="address-bar"]');
    this.backButton = page.locator('[data-testid="nav-back"]');
    this.forwardButton = page.locator('[data-testid="nav-forward"]');
    this.refreshButton = page.locator('[data-testid="nav-refresh"]');
    this.menuButton = page.locator('[data-testid="menu-button"]');
    this.firstWebview = page.locator('webview').first();
    this.webviews = page.locator('webview');
  }

  get eventMirroringButtons(): Locator {
    return this.page.locator('button[title="Disable Event Mirroring"]');
  }

  get perDeviceRefreshButtons(): Locator {
    return this.page.locator('button[title="Refresh This View"]');
  }

  get scrollToTopButtons(): Locator {
    return this.page.locator('button[title="Scroll to Top"]');
  }

  get modifier(): 'Meta' | 'Control' {
    return process.platform === 'darwin' ? 'Meta' : 'Control';
  }

  async dismissModals() {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
  }

  async pressShortcut(key: string) {
    await this.page.keyboard.press(`${this.modifier}+${key}`);
  }

  async navigateTo(url: string, opts?: {timeout?: number}) {
    await this.addressBar.fill(url);
    await this.addressBar.press('Enter');
    await this.page.waitForTimeout(opts?.timeout ?? 2000);
  }

  async openMenuFlyout() {
    await this.menuButton.click();
    await this.page.waitForTimeout(300);
  }

  async closeMenuFlyout() {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  async openSettings() {
    await this.openMenuFlyout();
    await this.page.getByText('Settings').click();
    await this.page.waitForTimeout(500);
  }

  async openDeviceManager() {
    await this.page.locator('button[title="Device Manager"]').click();
    await this.page.getByText('DEFAULT DEVICES').waitFor({state: 'visible', timeout: 10_000});
  }

  async ensureDeviceManagerOpen() {
    const dmHeader = this.page.getByText('DEFAULT DEVICES');
    if (!(await dmHeader.isVisible())) {
      await this.openDeviceManager();
    }
  }

  async closeDeviceManager() {
    await this.page.locator('button[title="Close"]').click();
    await this.addressBar.waitFor({state: 'visible', timeout: 10_000});
  }

  async openAboutDialog() {
    await this.electronApp.evaluate(({Menu}) => {
      const appMenu = Menu.getApplicationMenu();
      const helpMenu = appMenu?.items.find((i: any) => i.label === 'Help');
      const aboutItem = helpMenu?.submenu?.items.find((i: any) => i.label === 'About');
      aboutItem?.click();
    });
    await this.page.waitForTimeout(1000);
  }

  async openSuiteSelector() {
    const suiteSelector = this.page.locator('[data-testid="suite-selector"]');
    const suiteSelectorBtn = suiteSelector.locator('button').first();
    await suiteSelectorBtn.click();
    await this.page.waitForTimeout(300);
  }

  /** Clear the hijacked alert log and return any messages captured so far. */
  async clearAlerts(): Promise<string[]> {
    return this.page.evaluate(() => {
      const w = window as any;
      const msgs: string[] = w.__e2eAlerts ?? [];
      w.__e2eAlerts = [];
      return msgs;
    });
  }

  /** Return alert messages captured since the last clear. */
  async getAlerts(): Promise<string[]> {
    return this.page.evaluate(() => (window as any).__e2eAlerts ?? []);
  }

  /** Return file paths passed to shell.showItemInFolder since the last clear. */
  async getShowItemCalls(): Promise<string[]> {
    return this.electronApp.evaluate(() => (global as any).__e2eShowItemCalls ?? []);
  }

  /** Clear the showItemInFolder call log and return captured paths. */
  async clearShowItemCalls(): Promise<string[]> {
    return this.electronApp.evaluate(() => {
      const calls: string[] = (global as any).__e2eShowItemCalls ?? [];
      (global as any).__e2eShowItemCalls = [];
      return calls;
    });
  }

  async openColorBlindnessDropdown() {
    const colorBlindControls = this.page.locator('[data-testid="color-blindness-controls"]');
    const dropdownBtn = colorBlindControls.locator('button').first();
    await dropdownBtn.click();
    await this.page.waitForTimeout(300);
  }
}
