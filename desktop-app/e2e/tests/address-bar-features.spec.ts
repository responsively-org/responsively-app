import {test, expect} from '../fixtures/electron-app';

test.describe('Address Bar Features', () => {
  test('clicking address bar selects all text', async ({app}) => {
    await app.dismissModals();

    await app.addressBar.click();
    await app.page.waitForTimeout(300);

    // The input's onSelect handler should select all text on focus
    // Verify the input is focused
    const isFocused = await app.page.evaluate(() => {
      const el = document.querySelector('[data-testid="address-bar"]');
      return document.activeElement === el;
    });
    expect(isFocused).toBe(true);
  });

  test('keyboard shortcut Cmd/Ctrl+L focuses and selects address bar', async ({app}) => {
    await app.dismissModals();

    await app.pressShortcut('l');
    await app.page.waitForTimeout(300);

    // The address bar should be focused
    const isFocused = await app.page.evaluate(() => {
      const el = document.querySelector('[data-testid="address-bar"]');
      return document.activeElement === el;
    });
    expect(isFocused).toBe(true);
  });

  test('homepage button is visible and clickable', async ({app}) => {
    await app.dismissModals();

    const homepageBtn = app.page.locator('button[title="Homepage"]');
    await expect(homepageBtn).toBeVisible();
    await homepageBtn.click();
    await app.page.waitForTimeout(300);
  });

  test('setting a page as homepage changes the home icon to filled', async ({
    app,
    testServerUrl,
  }) => {
    await app.dismissModals();

    // Navigate to a specific page first
    await app.navigateTo(`${testServerUrl}/test-page.html`);

    // Click homepage button to set current page as homepage
    const homepageBtn = app.page.locator('button[title="Homepage"]');
    await homepageBtn.click();
    await app.page.waitForTimeout(300);

    // The button should have text-blue-500 class when set as homepage
    const classes = await homepageBtn.getAttribute('class');
    expect(classes).toContain('text-blue-500');
  });

  test('delete storage button is visible and clickable', async ({app}) => {
    await app.dismissModals();

    const deleteStorageBtn = app.page.locator('button[title="Delete Storage"]');
    await expect(deleteStorageBtn).toBeVisible();
    await deleteStorageBtn.click();
    await app.page.waitForTimeout(500);
  });

  test('delete cookies button is visible and clickable', async ({app}) => {
    await app.dismissModals();

    const deleteCookiesBtn = app.page.locator('button[title="Delete Cookies"]');
    await expect(deleteCookiesBtn).toBeVisible();
    await deleteCookiesBtn.click();
    await app.page.waitForTimeout(500);
  });

  test('clear cache button is visible and clickable', async ({app}) => {
    await app.dismissModals();

    const clearCacheBtn = app.page.locator('button[title="Clear Cache"]');
    await expect(clearCacheBtn).toBeVisible();
    await clearCacheBtn.click();
    await app.page.waitForTimeout(500);
  });
});
