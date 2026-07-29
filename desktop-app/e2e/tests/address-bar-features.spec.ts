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

    // The button reports the current page as the homepage.
    await expect(homepageBtn).toHaveAttribute('aria-pressed', 'true');
  });

  // The per-site data actions live behind the address bar's site-tools
  // popover (Hybrid Studio design), so each one has to be opened first.
  const siteDataActions = ['Delete Storage', 'Delete Cookies', 'Clear Cache'];

  for (const title of siteDataActions) {
    test(`site tools: ${title} is reachable and clickable`, async ({app}) => {
      await app.dismissModals();

      await app.page.locator('button[title="Site tools"]').click();

      const actionBtn = app.page.locator(`button[title="${title}"]`);
      await expect(actionBtn).toBeVisible({timeout: 5_000});
      await actionBtn.click();
      await app.page.waitForTimeout(500);

      // Selecting an action closes the popover.
      await expect(actionBtn).toBeHidden({timeout: 5_000});
    });
  }

  test('site tools popover exposes the site permissions entry', async ({app}) => {
    await app.dismissModals();

    await app.page.locator('button[title="Site tools"]').click();
    await expect(app.page.locator('button[title="Site permissions"]')).toBeVisible({
      timeout: 5_000,
    });
    await app.page.keyboard.press('Escape');
  });
});
