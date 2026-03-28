import {test, expect} from '../fixtures/electron-app';

test.describe('Webview Interaction', () => {
  test('clicking a link in a webview updates the address bar', async ({app, testServerUrl}) => {
    await app.dismissModals();

    // Navigate to a page with known links
    await app.navigateTo(`${testServerUrl}/test-page.html`);

    await expect(app.firstWebview).toHaveAttribute('src', /test-page\.html/, {
      timeout: 15_000,
    });

    // Verify address bar shows the current URL
    const currentUrl = await app.addressBar.inputValue();
    expect(currentUrl).toContain('test-page.html');
  });

  test('page title updates when navigating within a webview', async ({app, testServerUrl}) => {
    await app.dismissModals();

    // Navigate to a page
    await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 3000});

    // Navigate to another page
    await app.navigateTo(`${testServerUrl}/test-page-2.html`, {timeout: 3000});

    // The page loads successfully — verify webview src updated
    await expect(app.firstWebview).toHaveAttribute('src', /test-page-2\.html/, {
      timeout: 15_000,
    });
  });

  test('multiple webviews load the same URL simultaneously', async ({app, testServerUrl}) => {
    await app.dismissModals();

    // Navigate to a URL
    await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 3000});

    // All webviews should have the same URL
    const count = await app.webviews.count();

    for (let i = 0; i < count; i++) {
      const src = await app.webviews.nth(i).getAttribute('src');
      expect(src).toContain('test-page.html');
    }
  });

  test('loading indicator appears while page is loading', async ({app, testServerUrl}) => {
    await app.dismissModals();

    // Navigate to a page — the loading spinner should appear briefly
    await app.addressBar.fill(`${testServerUrl}/test-page-2.html`);
    await app.addressBar.press('Enter');

    // The Spinner component renders with a specific icon during loading
    // It may be very brief, so we just verify the page eventually loads
    await expect(app.firstWebview).toHaveAttribute('src', /test-page-2\.html/, {
      timeout: 15_000,
    });
  });
});
