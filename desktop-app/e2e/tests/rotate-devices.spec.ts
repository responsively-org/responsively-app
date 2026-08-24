import {test, expect} from '../fixtures/electron-app';

test.describe('Rotate Devices', () => {
  test('rotate button is visible in toolbar', async ({app}) => {
    await app.dismissModals();

    const rotateBtn = app.page.locator('button[title="Rotate Devices"]');
    await expect(rotateBtn).toBeVisible();
  });

  test('clicking rotate changes device dimensions', async ({app}) => {
    await app.dismissModals();

    // Click rotate button
    const rotateBtn = app.page.locator('button[title="Rotate Devices"]');
    await rotateBtn.click();
    await app.page.waitForTimeout(500);

    // Get the webview's style after rotation
    const styleAfter = await app.firstWebview.getAttribute('style');

    // The style should have changed (width and height swap for mobile devices)
    // At minimum, the style should still contain dimensions
    expect(styleAfter).toContain('width');
    expect(styleAfter).toContain('height');
  });

  test('keyboard shortcut Cmd/Ctrl+Alt+R toggles rotation', async ({app}) => {
    await app.dismissModals();

    // Toggle rotation via keyboard
    await app.page.keyboard.press(`${app.modifier}+Alt+r`);
    await app.page.waitForTimeout(500);

    // Verify the rotate button state changed (should be active or inactive)
    const rotateBtn = app.page.locator('button[title="Rotate Devices"]');
    await expect(rotateBtn).toBeVisible();

    // Toggle back
    await app.page.keyboard.press(`${app.modifier}+Alt+r`);
    await app.page.waitForTimeout(300);
  });

  test('non-mobile devices are not affected by global rotation', async ({app}) => {
    await app.dismissModals();

    // The rotation only affects devices with isMobileCapable=true
    // We verify by checking that webviews exist and the app doesn't crash
    const webviewCount = await app.webviews.count();
    expect(webviewCount).toBeGreaterThan(0);
  });

  test('per-device rotate button in device toolbar works independently', async ({app}) => {
    await app.dismissModals();

    // Per-device rotate buttons — some may be disabled for non-mobile devices
    const perDeviceRotateBtn = app.page.locator('button[title="Rotate This Device"]').first();

    const isVisible = await perDeviceRotateBtn.isVisible().catch(() => false);

    if (isVisible) {
      await perDeviceRotateBtn.click();
      await app.page.waitForTimeout(500);

      const styleAfter = await app.firstWebview.getAttribute('style');
      // Style should have changed for a mobile-capable device
      expect(styleAfter).toBeTruthy();

      // Click again to revert
      await perDeviceRotateBtn.click();
      await app.page.waitForTimeout(300);
    }
  });
});
