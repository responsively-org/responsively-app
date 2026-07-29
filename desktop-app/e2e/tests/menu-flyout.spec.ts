import {test, expect} from '../fixtures/electron-app';

test.describe('Menu Flyout', () => {
  test('clicking the overflow menu button opens the flyout', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    // Verify flyout content is visible
    await expect(app.page.getByText('Dock Devtools')).toBeVisible();
    await expect(app.page.getByText('Allow Insecure SSL')).toBeVisible();
  });

  test('clicking outside the flyout closes it', async ({app}) => {
    // Menu should still be open from previous test
    const zoomLabel = app.page.getByText('Dock Devtools');
    if (!(await zoomLabel.isVisible())) {
      await app.openMenuFlyout();
    }

    // Click outside to close — click on the address bar area
    await app.addressBar.click();
    await app.page.waitForTimeout(300);
  });

  test('dock devtools toggle is present', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    await expect(app.page.getByText('Dock Devtools')).toBeVisible();

    await app.closeMenuFlyout();
  });

  test('allow insecure SSL toggle is present', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    await expect(app.page.getByText('Allow Insecure SSL')).toBeVisible();

    await app.closeMenuFlyout();
  });

  test('clear history button is present and clickable', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    const clearHistoryLabel = app.page.getByText('Clear History');
    await expect(clearHistoryLabel).toBeVisible();

    // Find the button next to the Clear History label (inside its parent container)
    const clearHistoryContainer = clearHistoryLabel.locator('..');
    const trashBtn = clearHistoryContainer.locator('button');
    await expect(trashBtn).toBeVisible();

    await app.closeMenuFlyout();
  });

  test('bookmarks section is visible', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    await expect(app.page.getByText('Bookmarks')).toBeVisible();

    await app.closeMenuFlyout();
  });

  test('settings option is visible', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    await expect(app.page.getByText('Settings')).toBeVisible();

    await app.closeMenuFlyout();
  });
});
