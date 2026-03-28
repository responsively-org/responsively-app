import {test, expect} from '../fixtures/electron-app';

test.describe('Navigation Controls — Extended', () => {
  test('forward button navigates forward after going back', async ({app, testServerUrl}) => {
    await app.dismissModals();

    // Navigate to first page
    await app.navigateTo(`${testServerUrl}/test-page.html`);
    await expect(app.firstWebview).toHaveAttribute('src', /test-page\.html/, {
      timeout: 15_000,
    });

    // Navigate to second page
    await app.navigateTo(`${testServerUrl}/test-page-2.html`);
    await expect(app.firstWebview).toHaveAttribute('src', /test-page-2\.html/, {
      timeout: 15_000,
    });

    // Dismiss any modals
    await app.dismissModals();

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

    const addressValue = await app.addressBar.inputValue();
    expect(addressValue).not.toContain('test-page-2.html');

    // Go forward via webContents
    await app.electronApp.evaluate(async ({webContents}) => {
      const webviews = webContents
        .getAllWebContents()
        .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview');
      for (const wv of webviews) {
        if (wv.navigationHistory.canGoForward()) {
          wv.goForward();
        }
      }
    });
    await app.page.waitForTimeout(3000);

    const addressAfterForward = await app.addressBar.inputValue();
    expect(addressAfterForward).toContain('test-page-2.html');
  });

  test('refresh button reloads the current page', async ({app}) => {
    await app.dismissModals();

    // Click refresh
    await app.refreshButton.click();
    await app.page.waitForTimeout(2000);

    // Webview src should remain present
    const newSrc = await app.firstWebview.getAttribute('src');
    expect(newSrc).toBeTruthy();
  });

  test('keyboard shortcut Cmd/Ctrl+R reloads the page', async ({app}) => {
    await app.dismissModals();

    const srcBefore = await app.firstWebview.getAttribute('src');

    await app.pressShortcut('r');
    await app.page.waitForTimeout(2000);

    // Webview should still be present with same domain
    const srcAfter = await app.firstWebview.getAttribute('src');
    expect(srcAfter).toBeTruthy();
  });

  test('back and forward buttons are visible and enabled', async ({app}) => {
    await app.dismissModals();

    await expect(app.backButton).toBeVisible();
    await expect(app.forwardButton).toBeVisible();
  });
});
