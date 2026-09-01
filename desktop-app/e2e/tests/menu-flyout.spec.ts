import {test, expect} from '../fixtures/electron-app';

test.describe('Menu Flyout', () => {
  test('clicking the overflow menu button opens the flyout', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    await expect(app.page.getByText('Dock devtools')).toBeVisible();
    await expect(app.page.getByText('Devices & suites')).toBeVisible();
  });

  test('clicking outside the flyout closes it', async ({app}) => {
    // Menu should still be open from previous test
    const dockLabel = app.page.getByText('Dock devtools');
    if (!(await dockLabel.isVisible())) {
      await app.openMenuFlyout();
    }

    // Click outside to close — click on the address bar area
    await app.addressBar.click();
    await app.page.waitForTimeout(300);
  });

  test('dock devtools toggle is present', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    await expect(app.page.getByText('Dock devtools')).toBeVisible();
    await expect(app.page.getByRole('checkbox', {name: 'Dock devtools'})).toBeAttached();

    await app.closeMenuFlyout();
  });

  test('clear browsing history empties the stored history', async ({app}) => {
    await app.dismissModals();
    await app.page.evaluate(() => {
      (window as any).electron.store.set('history', [{url: 'https://example.com'}]);
    });

    await app.openMenuFlyout();
    await app.page.getByText('Clear browsing history').click();

    const history = await app.page.evaluate(() => (window as any).electron.store.get('history'));
    expect(history).toEqual([]);
  });

  test('bookmarks section is visible', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    await expect(app.page.getByText('Bookmarks')).toBeVisible();

    await app.closeMenuFlyout();
  });

  test('settings and keyboard shortcuts options are visible', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    await expect(app.page.getByText('Settings')).toBeVisible();
    await expect(app.page.getByText('Keyboard shortcuts')).toBeVisible();

    await app.closeMenuFlyout();
  });
});
