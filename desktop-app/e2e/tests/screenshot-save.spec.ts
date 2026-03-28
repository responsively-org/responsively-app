import {test as baseTest, expect} from '../fixtures/electron-app';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Extend the base test to provide a dedicated screenshot directory
const test = baseTest.extend<{screenshotDir: string}>({
  screenshotDir: async ({app}, use) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-screenshots-'));
    await app.page.evaluate((d: string) => {
      (window as any).electron.store.set('userPreferences.screenshot.saveLocation', d);
    }, dir);
    await use(dir);
    try {
      fs.rmSync(dir, {recursive: true, force: true});
    } catch {
      // Ignore cleanup errors
    }
  },
});

function getJpegs(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.jpeg'))
      .sort();
  } catch {
    return [];
  }
}

test.describe('Screenshot Save', () => {
  test.beforeEach(async ({app}) => {
    // Remove any stuck HeadlessUI modal overlay from previous tests
    await app.page.evaluate(() => {
      document.querySelector('#headlessui-portal-root')?.remove();
    });
  });

  test('screenshot all webviews saves JPEG files to disk and opens folder', async ({
    app,
    screenshotDir,
    testServerUrl,
  }) => {
    await app.dismissModals();
    await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 3000});

    // Ensure webview has actually loaded before screenshotting
    await expect(app.firstWebview).toHaveAttribute('src', /test-page\.html/, {
      timeout: 10_000,
    });
    await app.page.waitForTimeout(1000);

    await app.clearShowItemCalls();
    const beforeFiles = getJpegs(screenshotDir);

    const screenshotBtn = app.page.locator('button[title="Screenshot All WebViews"]');
    await screenshotBtn.click();

    // Wait for screenshot files to appear
    await expect
      .poll(() => getJpegs(screenshotDir).length, {timeout: 15_000})
      .toBeGreaterThan(beforeFiles.length);

    const afterFiles = getJpegs(screenshotDir);
    // Each file should be non-empty
    for (const file of afterFiles) {
      const stat = fs.statSync(path.join(screenshotDir, file));
      expect(stat.size).toBeGreaterThan(0);
    }

    // Verify shell.showItemInFolder was called for each saved file
    await expect
      .poll(async () => (await app.getShowItemCalls()).length, {timeout: 5_000})
      .toBeGreaterThanOrEqual(afterFiles.length);

    const calls = await app.getShowItemCalls();
    for (const call of calls) {
      expect(call).toContain(screenshotDir);
      expect(call).toMatch(/\.jpeg$/);
    }
  });

  test('screenshot filename includes device name and timestamp', async ({
    app,
    screenshotDir,
    testServerUrl,
  }) => {
    await app.dismissModals();
    await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 3000});

    // Ensure webview has actually loaded before screenshotting
    await expect(app.firstWebview).toHaveAttribute('src', /test-page\.html/, {
      timeout: 10_000,
    });
    await app.page.waitForTimeout(1000);

    // Clear directory
    for (const f of getJpegs(screenshotDir)) {
      fs.unlinkSync(path.join(screenshotDir, f));
    }

    const screenshotBtn = app.page.locator('button[title="Screenshot All WebViews"]');
    await screenshotBtn.click();

    await expect.poll(() => getJpegs(screenshotDir).length, {timeout: 15_000}).toBeGreaterThan(0);

    const files = getJpegs(screenshotDir);
    // Filename pattern: {deviceName}-{timestamp}.jpeg
    for (const file of files) {
      expect(file).toMatch(/^.+-\d+\.jpeg$/);
    }
  });

  test('per-device quick screenshot saves a single file and opens folder', async ({
    app,
    screenshotDir,
    testServerUrl,
  }) => {
    await app.dismissModals();
    await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 3000});

    // Ensure webview has actually loaded before screenshotting
    await expect(app.firstWebview).toHaveAttribute('src', /test-page\.html/, {
      timeout: 10_000,
    });
    await app.page.waitForTimeout(1000);

    // Clear directory and showItem call log
    for (const f of getJpegs(screenshotDir)) {
      fs.unlinkSync(path.join(screenshotDir, f));
    }
    await app.clearShowItemCalls();

    const quickScreenshotBtn = app.page.locator('button[title="Quick Screenshot"]').first();
    await expect(quickScreenshotBtn).toBeVisible();
    await quickScreenshotBtn.click({force: true});

    await expect.poll(() => getJpegs(screenshotDir).length, {timeout: 15_000}).toBe(1);

    const file = getJpegs(screenshotDir)[0];
    const stat = fs.statSync(path.join(screenshotDir, file));
    expect(stat.size).toBeGreaterThan(0);

    // Verify shell.showItemInFolder was called with the saved file path
    await expect.poll(async () => (await app.getShowItemCalls()).length, {timeout: 5_000}).toBe(1);

    const calls = await app.getShowItemCalls();
    expect(calls[0]).toContain(screenshotDir);
    expect(calls[0]).toContain(file);
  });

  test('per-device full page screenshot saves a file and opens folder', async ({
    app,
    screenshotDir,
    testServerUrl,
  }) => {
    await app.dismissModals();
    await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 3000});

    // Ensure webview has actually loaded before screenshotting
    await expect(app.firstWebview).toHaveAttribute('src', /test-page\.html/, {
      timeout: 10_000,
    });
    await app.page.waitForTimeout(1000);

    // Clear directory and showItem call log
    for (const f of getJpegs(screenshotDir)) {
      fs.unlinkSync(path.join(screenshotDir, f));
    }
    await app.clearShowItemCalls();

    const fullPageBtn = app.page.locator('button[title="Full Page Screenshot"]').first();
    await expect(fullPageBtn).toBeVisible();
    await fullPageBtn.click({force: true});

    await expect.poll(() => getJpegs(screenshotDir).length, {timeout: 15_000}).toBe(1);

    const file = getJpegs(screenshotDir)[0];
    const stat = fs.statSync(path.join(screenshotDir, file));
    expect(stat.size).toBeGreaterThan(0);

    // Verify shell.showItemInFolder was called with the saved file path
    await expect.poll(async () => (await app.getShowItemCalls()).length, {timeout: 5_000}).toBe(1);

    const calls = await app.getShowItemCalls();
    expect(calls[0]).toContain(screenshotDir);
    expect(calls[0]).toContain(file);
  });
});
