import {test, expect} from '../fixtures/electron-app';

test.describe('URL Navigation', () => {
  test('type a URL and press Enter navigates', async ({mainWindow}) => {
    const addressBar = mainWindow.locator('[data-testid="address-bar"]');

    await addressBar.fill('https://example.com');
    await addressBar.press('Enter');

    await expect(addressBar).toHaveValue(/example\.com/, {timeout: 15_000});
  });

  test('bare domain gets https:// prepended', async ({mainWindow}) => {
    const addressBar = mainWindow.locator('[data-testid="address-bar"]');

    await addressBar.fill('example.com');
    await mainWindow.waitForTimeout(200);
    await addressBar.press('Enter');

    // The webview src should have the protocol-prepended URL
    const webview = mainWindow.locator('webview').first();
    await expect(webview).toHaveAttribute('src', /^https:\/\/example\.com/, {
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

  test('back button navigates to previous page', async ({mainWindow}) => {
    const addressBar = mainWindow.locator('[data-testid="address-bar"]');
    const backBtn = mainWindow.locator('[data-testid="nav-back"]');
    const webview = mainWindow.locator('webview').first();

    // Navigate to a known page and wait for the webview to fully load it
    await addressBar.fill('https://example.com');
    await addressBar.press('Enter');
    await expect(webview).toHaveAttribute('src', /example\.com/, {
      timeout: 15_000,
    });
    await mainWindow.waitForTimeout(2000);

    // Navigate to a second page and wait for the webview to load
    await addressBar.fill('https://www.w3.org');
    await addressBar.press('Enter');
    await expect(webview).toHaveAttribute('src', /w3\.org/, {
      timeout: 15_000,
    });
    await mainWindow.waitForTimeout(2000);

    // Dismiss any modals
    await mainWindow.keyboard.press('Escape');
    await mainWindow.waitForTimeout(500);

    // Go back — webview should return to the first page
    await backBtn.click();
    await expect(webview).toHaveAttribute('src', /example\.com/, {
      timeout: 15_000,
    });
  });
});
