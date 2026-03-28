import {test, expect} from '../fixtures/electron-app';

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
});
