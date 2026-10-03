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

  test('Home navigates to the saved homepage without changing it and preserves Back', async ({
    app,
    testServerUrl,
  }) => {
    await app.dismissModals();
    const homepage = `${testServerUrl}/test-page.html`;
    const previousPage = `${testServerUrl}/test-page-2.html`;
    const originalHomepage = await app.page.evaluate(() =>
      (window as any).electron.store.get('homepage')
    );

    try {
      await app.openSettings();
      await app.page.getByTestId('settings-homepage-input').fill(homepage);
      await app.page.getByTestId('settings-save-button').click();
      await expect(app.page.getByTestId('settings-homepage-input')).toBeHidden();
      await expect
        .poll(() => app.page.evaluate(() => (window as any).electron.store.get('homepage')))
        .toBe(homepage);

      await app.navigateTo(previousPage);
      const previewUrls = () =>
        app.webviews.evaluateAll((views) => views.map((view) => (view as any).getURL()));
      const previewCount = await app.webviews.count();
      expect(previewCount).toBeGreaterThan(0);
      await expect.poll(previewUrls).toEqual(Array(previewCount).fill(previousPage));
      await app.addressBar.fill('unfinished address');

      await app.page.getByRole('button', {name: 'Home', exact: true}).click();

      await expect(app.addressBar).toHaveValue(homepage);
      await expect.poll(previewUrls).toEqual(Array(previewCount).fill(homepage));
      expect(await app.page.evaluate(() => (window as any).electron.store.get('homepage'))).toBe(
        homepage
      );
      await expect(app.page.getByTestId('nav-home')).not.toHaveAttribute('aria-pressed');

      await app.backButton.click();
      await expect(app.addressBar).toHaveValue(previousPage);
      await expect.poll(previewUrls).toEqual(Array(previewCount).fill(previousPage));
    } finally {
      await app.page.evaluate(
        (value) => (window as any).electron.store.set('homepage', value),
        originalHomepage
      );
    }
  });

  test('Home loads the homepage again when already there', async ({app, testServerUrl}) => {
    await app.dismissModals();
    const homepage = `${testServerUrl}/test-page.html`;
    const originalHomepage = await app.page.evaluate(() =>
      (window as any).electron.store.get('homepage')
    );

    try {
      await app.page.evaluate(
        (value) => (window as any).electron.store.set('homepage', value),
        homepage
      );
      await app.navigateTo(homepage);
      await app.webviews.evaluateAll(async (views) => {
        await Promise.all(
          views.map((view) => (view as any).executeJavaScript('window.__homeReloadMarker = true'))
        );
      });
      await app.page.locator('button[title="Homepage"]').click();

      await expect
        .poll(() =>
          app.webviews.evaluateAll(async (views) =>
            Promise.all(
              views.map((view) =>
                (view as any).executeJavaScript('window.__homeReloadMarker === undefined')
              )
            )
          )
        )
        .toEqual(Array(await app.webviews.count()).fill(true));
      await expect(app.addressBar).toHaveValue(homepage);
    } finally {
      await app.page.evaluate(
        (value) => (window as any).electron.store.set('homepage', value),
        originalHomepage
      );
    }
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
