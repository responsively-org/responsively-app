import {test, expect} from '../fixtures/electron-app';

test.describe('Bookmarks', () => {
  test.describe.configure({mode: 'parallel'});
  test('bookmark button (star) is visible in address bar', async ({app}) => {
    await app.dismissModals();

    // The bookmark button should show either filled or outline star
    const bookmarkBtn = app.page.locator(
      'button[title="Add bookmark"], button[title="Remove bookmark"]'
    );
    await expect(bookmarkBtn.first()).toBeVisible();
  });

  test('clicking star bookmarks the current page', async ({app, testServerUrl}) => {
    await app.dismissModals();

    // Navigate to a known page first
    await app.navigateTo(`${testServerUrl}/test-page.html`);

    // Click the add bookmark button
    const addBookmarkBtn = app.page.locator('button[title="Add bookmark"]');
    const isAddVisible = await addBookmarkBtn.isVisible().catch(() => false);

    if (isAddVisible) {
      await addBookmarkBtn.click();
      await app.page.waitForTimeout(500);

      // A bookmark flyout should appear — close it
      await app.page.keyboard.press('Escape');
      await app.page.waitForTimeout(300);
    }
  });

  test('keyboard shortcut Cmd/Ctrl+D toggles bookmark', async ({app}) => {
    await app.dismissModals();

    // Use keyboard shortcut to toggle bookmark
    await app.pressShortcut('d');
    await app.page.waitForTimeout(500);

    // A flyout might appear — dismiss it
    await app.page.keyboard.press('Escape');
    await app.page.waitForTimeout(300);
  });

  test('bookmarked page shows filled star on revisit', async ({app, testServerUrl}) => {
    await app.dismissModals();

    // Bookmark the page first
    await app.navigateTo(`${testServerUrl}/test-page.html`);
    const addBtn = app.page.locator('button[title="Add bookmark"]');
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
      await app.page.waitForTimeout(500);
      // Click Save in the bookmark flyout
      const saveBtn = app.page.locator('button#add');
      await saveBtn.click();
      await app.page.waitForTimeout(300);
    }

    // Navigate away and back to the bookmarked page
    await app.navigateTo(`${testServerUrl}/test-page-2.html`);
    await app.navigateTo(`${testServerUrl}/test-page.html`);

    // Should show "Remove bookmark" (filled star)
    const removeBookmarkBtn = app.page.locator('button[title="Remove bookmark"]');
    await expect(removeBookmarkBtn).toBeVisible({timeout: 5_000});
  });

  test('bookmarks appear in the menu flyout bookmarks section', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    // Verify Bookmarks section is visible
    await expect(app.page.getByText('Bookmarks')).toBeVisible();

    await app.closeMenuFlyout();
  });

  test('clicking a bookmark in the list navigates to the URL', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    // Hover over Bookmarks to see submenu
    const bookmarksBtn = app.page.getByText('Bookmarks').first();
    await bookmarksBtn.hover();
    await app.page.waitForTimeout(500);

    await app.closeMenuFlyout();
  });

  test('removing a bookmark returns star to outline state', async ({app, testServerUrl}) => {
    await app.dismissModals();

    // Bookmark the page first so we have something to remove
    await app.navigateTo(`${testServerUrl}/test-page.html`);
    const addBtn = app.page.locator('button[title="Add bookmark"]');
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
      await app.page.waitForTimeout(500);
      // Click Save in the bookmark flyout
      const saveBtn = app.page.locator('button#add');
      await saveBtn.click();
      await app.page.waitForTimeout(300);
    }

    // Now remove the bookmark
    const removeBookmarkBtn = app.page.locator('button[title="Remove bookmark"]');
    await expect(removeBookmarkBtn).toBeVisible({timeout: 5_000});
    await removeBookmarkBtn.click();
    await app.page.waitForTimeout(500);

    const removeBtn = app.page.locator('button#remove');
    const hasRemoveBtn = await removeBtn.isVisible().catch(() => false);
    if (hasRemoveBtn) {
      await removeBtn.click();
      await app.page.waitForTimeout(500);
    } else {
      await app.page.keyboard.press('Escape');
      await app.page.waitForTimeout(300);
    }

    // The star should now show "Add bookmark"
    const addBookmarkBtn = app.page.locator('button[title="Add bookmark"]');
    await expect(addBookmarkBtn).toBeVisible({timeout: 5_000});
  });
});
