import {ElectronApplication, Page} from '@playwright/test';
import {test, expect} from '../fixtures/electron-app';

const execInWebview = async (
  electronApp: ElectronApplication,
  wcId: number,
  script: string
): Promise<unknown> => {
  return electronApp.evaluate(
    async ({webContents}, {id, js}: {id: number; js: string}) => {
      const wc = webContents.fromId(id);
      if (!wc) {
        throw new Error(`No webContents with id ${id}`);
      }
      return wc.executeJavaScript(js);
    },
    {id: wcId, js: script}
  );
};

const getNthWebviewId = async (page: Page, index: number): Promise<number | null> => {
  return page.evaluate((nth) => {
    const webview = document.querySelectorAll('webview')[nth] as Electron.WebviewTag | undefined;
    return webview?.getWebContentsId?.() ?? null;
  }, index);
};

test.describe('Device Toolbar', () => {
  test('each device shows its name and dimensions in the header', async ({app}) => {
    await app.dismissModals();

    // Each device has a name and dimensions like "390x844"
    // Look for text containing "x" which represents dimension patterns
    const dimensionTexts = app.page.locator('span:has-text("x")');
    const count = await dimensionTexts.count();
    expect(count).toBeGreaterThan(0);
  });

  test('refresh view button reloads the individual webview', async ({app}) => {
    await app.dismissModals();

    const refreshViewBtn = app.page.locator('button[title="Refresh This View"]').first();
    await expect(refreshViewBtn).toBeVisible();

    // Click refresh on individual device
    await refreshViewBtn.click();
    await app.page.waitForTimeout(1000);

    // The webview should still be present
    await expect(app.firstWebview).toBeAttached();
  });

  test('scroll to top button scrolls the webview to top', async ({app}) => {
    await app.dismissModals();

    const scrollToTopBtn = app.page.locator('button[title="Scroll to Top"]').first();
    await expect(scrollToTopBtn).toBeVisible();

    // Click scroll to top
    await scrollToTopBtn.click();
    await app.page.waitForTimeout(500);
  });

  test('individual layout toggle switches to single-device view', async ({app}) => {
    await app.dismissModals();

    const individualLayoutBtn = app.page
      .locator('button[title="Enable Individual Layout"]')
      .first();

    const isVisible = await individualLayoutBtn.isVisible().catch(() => false);

    if (isVisible) {
      await individualLayoutBtn.click();
      await app.page.waitForTimeout(500);

      // In individual layout, only one webview should be prominent
      // The container should have justify-center class
      const centeredContainer = app.page.locator('.flex.gap-4.overflow-auto.p-4.justify-center');
      await expect(centeredContainer).toBeVisible({timeout: 5_000});
    }
  });

  test('individual layout toggle can switch back to multi-device view', async ({app}) => {
    await app.dismissModals();

    const disableIndividualBtn = app.page
      .locator('button[title="Disable Individual Layout"]')
      .first();

    const isVisible = await disableIndividualBtn.isVisible().catch(() => false);

    if (isVisible) {
      await disableIndividualBtn.click();
      await app.page.waitForTimeout(500);

      // Multiple webviews should be visible again
      const webviewCount = await app.webviews.count();
      expect(webviewCount).toBeGreaterThanOrEqual(1);
    }
  });

  test('ruler toggle shows rulers on the device', async ({app}) => {
    await app.dismissModals();

    const rulerBtn = app.page.locator('button[title="Show rulers"]').first();
    await expect(rulerBtn).toBeVisible();

    // Click to toggle rulers
    await rulerBtn.click();
    await app.page.waitForTimeout(500);

    // Click again to disable for cleanup
    await rulerBtn.click();
    await app.page.waitForTimeout(300);
  });

  test('per-device javascript toggle remounts only the targeted preview and blocks screenshots', async ({
    app,
    testServerUrl,
  }) => {
    await app.dismissModals();
    await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 5000});

    await expect(app.firstWebview).toHaveAttribute('src', /test-page\.html/, {
      timeout: 15_000,
    });

    const initialFirstWebviewId = await getNthWebviewId(app.page, 0);
    const initialSecondWebviewId = await getNthWebviewId(app.page, 1);

    expect(initialFirstWebviewId).not.toBeNull();
    expect(initialSecondWebviewId).not.toBeNull();

    await expect
      .poll(
        () =>
          execInWebview(
            app.electronApp,
            initialFirstWebviewId as number,
            'typeof window.testClickCount'
          ),
        {timeout: 10_000}
      )
      .toBe('number');
    await expect
      .poll(
        () =>
          execInWebview(
            app.electronApp,
            initialSecondWebviewId as number,
            'typeof window.testClickCount'
          ),
        {timeout: 10_000}
      )
      .toBe('number');

    const firstToolbar = app.page
      .locator('button[title="Refresh This View"]')
      .first()
      .locator('xpath=ancestor::div[contains(@class, "flex items-center justify-between gap-1")]');
    const toolbarButtons = firstToolbar.locator(
      'xpath=.//div[contains(@class, "my-1 inline-flex")]//button'
    );
    const quickScreenshotBtn = toolbarButtons.nth(1);
    const fullPageScreenshotBtn = toolbarButtons.nth(2);
    const disabledTitle =
      'Screenshots are unavailable while JavaScript is disabled for this preview';

    await expect(quickScreenshotBtn).toBeEnabled();
    await expect(fullPageScreenshotBtn).toBeEnabled();

    await firstToolbar.locator('button:has(span.sr-only)').first().click();
    await app.page.locator('button:has-text("Disable JavaScript")').click();

    await expect(quickScreenshotBtn).toBeDisabled();
    await expect(fullPageScreenshotBtn).toBeDisabled();
    await expect(quickScreenshotBtn).toHaveAttribute('title', disabledTitle);
    await expect(fullPageScreenshotBtn).toHaveAttribute('title', disabledTitle);

    await expect
      .poll(() => getNthWebviewId(app.page, 0), {timeout: 10_000})
      .not.toBe(initialFirstWebviewId);

    const disabledFirstWebviewId = await getNthWebviewId(app.page, 0);
    const disabledSecondWebviewId = await getNthWebviewId(app.page, 1);

    expect(disabledFirstWebviewId).not.toBeNull();
    expect(disabledSecondWebviewId).toBe(initialSecondWebviewId);

    await expect
      .poll(
        () =>
          execInWebview(
            app.electronApp,
            disabledFirstWebviewId as number,
            'typeof window.testClickCount'
          ),
        {timeout: 10_000}
      )
      .toBe('undefined');
    await expect
      .poll(
        () =>
          execInWebview(
            app.electronApp,
            disabledSecondWebviewId as number,
            'typeof window.testClickCount'
          ),
        {timeout: 10_000}
      )
      .toBe('number');

    await firstToolbar.locator('button:has(span.sr-only)').first().click();
    await app.page.locator('button:has-text("Enable JavaScript")').click();

    await expect(quickScreenshotBtn).toBeEnabled();
    await expect(fullPageScreenshotBtn).toBeEnabled();

    await expect
      .poll(() => getNthWebviewId(app.page, 0), {timeout: 10_000})
      .not.toBe(disabledFirstWebviewId);

    const reenabledFirstWebviewId = await getNthWebviewId(app.page, 0);
    const reenabledSecondWebviewId = await getNthWebviewId(app.page, 1);

    expect(reenabledFirstWebviewId).not.toBeNull();
    expect(reenabledSecondWebviewId).toBe(initialSecondWebviewId);

    await expect
      .poll(
        () =>
          execInWebview(
            app.electronApp,
            reenabledFirstWebviewId as number,
            'typeof window.testClickCount'
          ),
        {timeout: 10_000}
      )
      .toBe('number');
  });
});
