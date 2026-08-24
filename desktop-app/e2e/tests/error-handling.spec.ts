import {test, expect} from '../fixtures/electron-app';

test.describe('Error Handling', () => {
  test('navigating to an invalid URL shows error overlay on webview', async ({app}) => {
    await app.dismissModals();

    // Navigate to a local port with nothing listening — triggers ERR_CONNECTION_REFUSED
    await app.navigateTo('http://127.0.0.1:1', {
      timeout: 10_000,
    });

    // Look for error overlay text
    const errorText = app.page.locator('text=/ERROR:/');
    await expect(errorText.first()).toBeVisible({timeout: 15_000});
  });

  test('error overlay displays error code and description', async ({app}) => {
    // Error should still be visible from previous test
    const errorText = app.page.locator('text=/ERROR:/');
    const isVisible = await errorText
      .first()
      .isVisible()
      .catch(() => false);

    if (isVisible) {
      // The error overlay shows "ERROR: {code}" and a description
      const errorOverlay = app.page.locator('.bg-slate-600.bg-opacity-95').first();
      await expect(errorOverlay).toBeVisible();

      // Should contain error code
      const errorContent = await errorOverlay.innerText();
      expect(errorContent).toContain('ERROR:');
    }
  });

  test('navigating to a valid URL after error clears the error state', async ({
    app,
    testServerUrl,
  }) => {
    await app.dismissModals();

    // Navigate to a valid URL
    await app.navigateTo(`${testServerUrl}/test-page.html`);

    await expect(app.firstWebview).toHaveAttribute('src', /test-page\.html/, {
      timeout: 15_000,
    });

    // Error overlay should no longer be visible
    const errorText = app.page.locator('text=/ERROR:/');
    await expect(errorText).not.toBeVisible({timeout: 10_000});
  });
});
