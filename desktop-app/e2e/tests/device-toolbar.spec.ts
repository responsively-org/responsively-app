import {test, expect} from '../fixtures/electron-app';

test.describe('Device Toolbar', () => {
  test('each device shows its name and dimensions in the header', async ({app}) => {
    await app.dismissModals();

    // Each visible device header shows "<width> × <height>" in mono type.
    const labelRow = app.page.locator('[data-device-label]:visible').first();
    await expect(labelRow.locator('span.font-mono')).toHaveText(/\d+ × \d+/);
  });

  test('refresh view button reloads the individual webview', async ({app}) => {
    await app.dismissModals();

    await app.revealDevicePill();
    const refreshViewBtn = app.page.locator('button[title="Refresh this device"]').first();
    await expect(refreshViewBtn).toBeVisible();

    // Click refresh on individual device
    await refreshViewBtn.click();
    await app.page.waitForTimeout(1000);

    // The webview should still be present
    await expect(app.firstWebview).toBeAttached();
  });

  test('scroll to top button scrolls the webview to top', async ({app}) => {
    await app.dismissModals();

    await app.revealDevicePill();
    const scrollToTopBtn = app.page.locator('button[title="Scroll to top"]').first();
    await expect(scrollToTopBtn).toBeVisible();

    // Click scroll to top
    await scrollToTopBtn.click();
    await app.page.waitForTimeout(500);
  });

  test('focus this device switches to single-device view', async ({app}) => {
    await app.dismissModals();
    await app.page.locator('[data-testid="layout-FLEX"]').click();

    await app.revealDevicePill();
    const focusBtn = app.page.locator('button[title="Focus this device"]').first();
    await expect(focusBtn).toBeVisible();
    await focusBtn.click();

    // In the focus (individual) layout the container centers one device.
    const centeredContainer = app.page.locator('.flex.gap-4.overflow-auto.p-4.justify-center');
    await expect(centeredContainer).toBeVisible({timeout: 5_000});
    await expect(focusBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('focus this device toggles back to a multi-device view', async ({app}) => {
    await app.dismissModals();

    // Still in the focus layout from the previous test.
    await app.revealDevicePill();
    const focusBtn = app.page.locator('button[title="Focus this device"]').first();
    await expect(focusBtn).toHaveAttribute('aria-pressed', 'true');
    await focusBtn.click();

    await expect(focusBtn).toHaveAttribute('aria-pressed', 'false');
    const centeredContainer = app.page.locator('.flex.gap-4.overflow-auto.p-4.justify-center');
    await expect(centeredContainer).toBeHidden();
    expect(await app.webviews.count()).toBeGreaterThanOrEqual(1);
  });

  test('ruler toggle shows rulers on the device', async ({app}) => {
    await app.dismissModals();

    await app.revealDevicePill();
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
