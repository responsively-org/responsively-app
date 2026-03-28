import {test, expect} from '../fixtures/electron-app';

test.describe('URL Navigation', () => {
  test('type a URL and press Enter navigates', async ({mainWindow, testServerUrl}) => {
    const addressBar = mainWindow.locator('[data-testid="address-bar"]');

    await addressBar.fill(`${testServerUrl}/test-page.html`);
    await addressBar.press('Enter');

    await expect(addressBar).toHaveValue(/test-page\.html/, {timeout: 15_000});
  });

  test('address without protocol gets protocol prepended', async ({mainWindow, testServerUrl}) => {
    const addressBar = mainWindow.locator('[data-testid="address-bar"]');

    // Strip http:// to get bare address — app should prepend http:// back
    const bareAddress = testServerUrl.replace(/^http:\/\//, '') + '/test-page.html';
    await addressBar.fill(bareAddress);
    await mainWindow.waitForTimeout(200);
    await addressBar.press('Enter');

    // The webview src should have http:// prepended since it's an IP address
    const webview = mainWindow.locator('webview').first();
    await expect(webview).toHaveAttribute('src', /^http:\/\/127\.0\.0\.1/, {
      timeout: 15_000,
    });
  });

  test('localhost gets http:// prepended', async ({mainWindow}) => {
    const addressBar = mainWindow.locator('[data-testid="address-bar"]');

    await addressBar.fill('localhost:3000');
    await mainWindow.waitForTimeout(200);
    await addressBar.press('Enter');

    // Verify the webview src has http:// prepended
    const webview = mainWindow.locator('webview').first();
    await expect(webview).toHaveAttribute('src', /^http:\/\/localhost:3000/, {
      timeout: 15_000,
    });
  });

  test('back button navigates to previous page', async ({app, testServerUrl}) => {
    await app.dismissModals();

    // Previous test may have left webviews stuck loading an unresolvable URL
    // (localhost:3000). Stop pending loads so the address bar navigation goes through.
    await app.electronApp.evaluate(({webContents}) => {
      const webviews = webContents
        .getAllWebContents()
        .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview');
      for (const wv of webviews) {
        wv.stop();
      }
    });
    await app.page.waitForTimeout(500);

    await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 3000});
    await expect(app.firstWebview).toHaveAttribute('src', /test-page\.html/, {
      timeout: 15_000,
    });

    // Navigate to a second page and wait for the webview to load
    await app.navigateTo(`${testServerUrl}/test-page-2.html`);
    await expect(app.firstWebview).toHaveAttribute('src', /test-page-2\.html/, {
      timeout: 15_000,
    });

    // Go back via webContents to avoid PubSub accumulation issue
    await app.electronApp.evaluate(async ({webContents}) => {
      const webviews = webContents
        .getAllWebContents()
        .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview');
      for (const wv of webviews) {
        if (wv.navigationHistory.canGoBack()) {
          wv.goBack();
        }
      }
    });
    await app.page.waitForTimeout(3000);

    // The address bar should no longer show page 2
    const addressValue = await app.addressBar.inputValue();
    expect(addressValue).not.toContain('test-page-2.html');
  });
});
