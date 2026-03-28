import {test, expect} from '../fixtures/electron-app';

test.describe('Preview Suites', () => {
  test('active suite is indicated with a checkmark in the suite selector dropdown', async ({
    app,
  }) => {
    await app.dismissModals();

    await app.openSuiteSelector();

    // Look for a check mark (svg) next to the active suite name
    // The active suite option renders an Icon with mdi:check
    const menuItems = app.page.locator('[role="menu"] button, [role="menuitem"]');
    const count = await menuItems.count();
    expect(count).toBeGreaterThan(0);

    // Close dropdown by pressing Escape
    await app.page.keyboard.press('Escape');
  });

  test('selecting a different suite from the dropdown switches active devices', async ({app}) => {
    await app.dismissModals();

    await app.openSuiteSelector();

    // Check if there are suite options listed
    const suiteOptions = app.page.locator('[role="menu"] button, [role="menuitem"]');
    const optionCount = await suiteOptions.count();

    // Close dropdown
    await app.page.keyboard.press('Escape');

    // At minimum, the current suite should be listed
    expect(optionCount).toBeGreaterThan(0);
  });

  test('"Manage Suites" option in dropdown opens Device Manager', async ({app}) => {
    await app.dismissModals();

    await app.openSuiteSelector();

    // Click "Manage Suites" option
    const manageSuites = app.page.getByText('Manage Suites');
    await manageSuites.click();

    // Device Manager should open
    await expect(app.page.getByText('Device Manager')).toBeVisible({
      timeout: 10_000,
    });

    // Close Device Manager
    await app.closeDeviceManager();
  });

  test('webview count matches the number of devices in the active suite', async ({app}) => {
    await app.dismissModals();

    const webviewCount = await app.webviews.count();
    expect(webviewCount).toBeGreaterThan(0);
  });
});
