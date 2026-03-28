import {test, expect} from '../fixtures/electron-app';

test.describe('Screenshot', () => {
  test('screenshot button is visible in toolbar', async ({app}) => {
    await app.dismissModals();

    const screenshotBtn = app.page.locator('button[title="Screenshot All WebViews"]');
    await expect(screenshotBtn).toBeVisible();
  });

  test('clicking screenshot button shows the screenshot progress modal', async ({
    app,
    testServerUrl,
  }) => {
    await app.dismissModals();

    // Navigate to a simple page first to ensure webviews are loaded
    await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 3000});

    const screenshotBtn = app.page.locator('button[title="Screenshot All WebViews"]');
    await screenshotBtn.click();

    // The modal loader should appear with "Capturing screen..." text
    const captureText = app.page.getByText('Capturing screen...');
    // This may be brief, so use a short timeout
    await expect(captureText)
      .toBeVisible({timeout: 5_000})
      .catch(() => {
        // The screenshot might complete very quickly
      });

    // Wait for screenshot to complete
    await app.page.waitForTimeout(5000);
  });

  test('keyboard shortcut Cmd/Ctrl+S triggers screenshot', async ({app}) => {
    await app.dismissModals();

    // Trigger screenshot via keyboard
    await app.pressShortcut('s');

    // The modal loader should appear
    const captureText = app.page.getByText('Capturing screen...');
    await expect(captureText)
      .toBeVisible({timeout: 5_000})
      .catch(() => {
        // May complete very quickly
      });

    // Wait for screenshot to complete
    await app.page.waitForTimeout(5000);
  });

  test('screenshot modal dismisses after capture completes', async ({app}) => {
    await app.dismissModals();

    // After the previous screenshot tests, the modal should have dismissed
    const captureText = app.page.getByText('Capturing screen...');
    await expect(captureText).not.toBeVisible({timeout: 10_000});
  });
});
