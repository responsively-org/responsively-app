import {test, expect} from '../fixtures/electron-app';
import type {ElectronApplication} from '@playwright/test';

/**
 * Set the preferred color scheme on webview content via CDP.
 * Electron's nativeTheme.themeSource does not propagate to webview
 * guest pages, so we use CDP Emulation.setEmulatedMedia directly.
 */
async function setWebviewColorScheme(electronApp: ElectronApplication, scheme: 'dark' | 'light') {
  await electronApp.evaluate(async ({webContents}, s) => {
    const wv = webContents.getAllWebContents().find((wc) => (wc as any).getType() === 'webview');
    if (!wv) return;
    try {
      wv.debugger.attach('1.3');
    } catch {
      // Already attached
    }
    await wv.debugger.sendCommand('Emulation.setEmulatedMedia', {
      features: [{name: 'prefers-color-scheme', value: s}],
    });
  }, scheme);
}

/**
 * Capture a screenshot of the first webview's rendered content
 * and return the center pixel's RGB values.
 */
async function captureWebviewCenterPixel(electronApp: ElectronApplication) {
  return electronApp.evaluate(async ({webContents}) => {
    const wv = webContents.getAllWebContents().find((wc) => (wc as any).getType() === 'webview');
    if (!wv) return {r: 0, g: 0, b: 0};

    const image = await wv.capturePage();
    const size = image.getSize();
    const bitmap = image.toBitmap();

    const y = Math.floor(size.height / 2);
    const x = Math.floor(size.width / 2);
    const offset = (y * size.width + x) * 4;
    return {
      r: bitmap[offset],
      g: bitmap[offset + 1],
      b: bitmap[offset + 2],
    };
  });
}

test.describe('Device Color Scheme', () => {
  test('color scheme toggle button is visible in toolbar', async ({app}) => {
    await app.dismissModals();

    const colorSchemeBtn = app.page.locator('button[title="Device theme color toggle"]');
    await expect(colorSchemeBtn).toBeVisible();
  });

  test('clicking toggle changes the device theme', async ({app}) => {
    await app.dismissModals();

    const colorSchemeBtn = app.page.locator('button[title="Device theme color toggle"]');
    await colorSchemeBtn.click();
    await app.page.waitForTimeout(300);

    await expect(colorSchemeBtn).toBeVisible();
  });

  test('clicking toggle again reverts the device theme', async ({app}) => {
    await app.dismissModals();

    const colorSchemeBtn = app.page.locator('button[title="Device theme color toggle"]');
    await colorSchemeBtn.click();
    await app.page.waitForTimeout(300);

    await expect(colorSchemeBtn).toBeVisible();
  });

  test('toggle button sets nativeTheme to dark', async ({app}) => {
    await app.dismissModals();

    const colorSchemeBtn = app.page.locator('button[title="Device theme color toggle"]');
    await colorSchemeBtn.click();
    await app.page.waitForTimeout(5000);

    const shouldUseDark: boolean = await app.electronApp.evaluate(
      async ({nativeTheme}) => nativeTheme.shouldUseDarkColors
    );
    expect(shouldUseDark).toBe(true);

    // Toggle back
    await colorSchemeBtn.click();
    await app.page.waitForTimeout(300);

    const shouldUseDarkAfter: boolean = await app.electronApp.evaluate(
      async ({nativeTheme}) => nativeTheme.shouldUseDarkColors
    );
    expect(shouldUseDarkAfter).toBe(false);
  });

  test('dark color scheme changes webview background color', async ({app, testServerUrl}) => {
    await app.dismissModals();

    await app.navigateTo(`${testServerUrl}/color-scheme-test.html`);
    await app.page.waitForTimeout(2000);

    // Capture webview screenshot in light mode
    const lightPixel = await captureWebviewCenterPixel(app.electronApp);

    // Switch to dark color scheme
    await setWebviewColorScheme(app.electronApp, 'dark');
    await app.page.waitForTimeout(1000);

    // Capture webview screenshot in dark mode
    const darkPixel = await captureWebviewCenterPixel(app.electronApp);

    // Light should be bright (near white), dark should be noticeably darker
    const lightBrightness = lightPixel.r + lightPixel.g + lightPixel.b;
    const darkBrightness = darkPixel.r + darkPixel.g + darkPixel.b;

    expect(lightBrightness).toBeGreaterThan(600);
    expect(darkBrightness).toBeLessThan(300);

    // Reset
    await setWebviewColorScheme(app.electronApp, 'light');
  });

  test('toggling back to light restores light background', async ({app, testServerUrl}) => {
    await app.dismissModals();

    await app.navigateTo(`${testServerUrl}/color-scheme-test.html`);
    await app.page.waitForTimeout(2000);

    // Switch to dark, then back to light
    await setWebviewColorScheme(app.electronApp, 'dark');
    await app.page.waitForTimeout(1000);
    await setWebviewColorScheme(app.electronApp, 'light');
    await app.page.waitForTimeout(1000);

    // Capture webview screenshot after restoring light mode
    const pixel = await captureWebviewCenterPixel(app.electronApp);

    // Should be back to bright (light background)
    const brightness = pixel.r + pixel.g + pixel.b;
    expect(brightness).toBeGreaterThan(600);
  });
});
