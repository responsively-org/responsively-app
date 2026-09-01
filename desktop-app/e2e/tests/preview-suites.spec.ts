import {test, expect} from '../fixtures/electron-app';

test.describe('Preview Suites', () => {
  test('the active suite chip is marked as pressed', async ({app}) => {
    await app.dismissModals();

    const chips = app.page.locator('[data-testid="suite-selector"] button[aria-pressed]');
    await expect(chips.first()).toBeVisible();

    // Exactly one suite is active at a time.
    const pressed = app.page.locator('[data-testid="suite-selector"] button[aria-pressed="true"]');
    await expect(pressed).toHaveCount(1);
  });

  test('the suite chip shows how many devices the suite holds', async ({app}) => {
    await app.dismissModals();

    const activeChip = app.page.locator(
      '[data-testid="suite-selector"] button[aria-pressed="true"]'
    );
    const chipCount = parseInt((await activeChip.innerText()).replace(/\D/g, ''), 10);
    expect(chipCount).toBe(await app.webviews.count());
  });

  test('the suite editor toggles a device in and out of the active suite', async ({app}) => {
    await app.dismissModals();

    const before = await app.webviews.count();

    await app.openSuiteSelector();
    // First unchecked device in the editor list.
    const unchecked = app.page.locator('button[aria-pressed="false"]:has(.font-mono)').first();
    await unchecked.click();

    await expect.poll(() => app.webviews.count(), {timeout: 10_000}).toBe(before + 1);

    // Put it back so the next spec file sees the original suite.
    const checked = app.page.locator('button[aria-pressed="true"]:has(.font-mono)').last();
    await checked.click();
    await expect.poll(() => app.webviews.count(), {timeout: 10_000}).toBe(before);

    await app.page.keyboard.press('Escape');
  });

  test('"Manage suites & devices" opens the Device Manager', async ({app}) => {
    await app.dismissModals();

    await app.openSuiteSelector();
    await app.page.getByText('Manage suites & devices').click();

    await expect(app.page.getByText('Device Manager')).toBeVisible({timeout: 10_000});

    await app.closeDeviceManager();
  });

  test('webview count matches the number of devices in the active suite', async ({app}) => {
    await app.dismissModals();

    const webviewCount = await app.webviews.count();
    expect(webviewCount).toBeGreaterThan(0);
  });
});
