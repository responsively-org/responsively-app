import {test, expect} from '../fixtures/electron-app';

test.describe('Keyboard Shortcuts Modal', () => {
  test('shortcuts button opens the shortcuts modal', async ({app}) => {
    await app.dismissModals();

    const shortcutsBtn = app.page.locator('button[title="View Shortcuts"]');
    await expect(shortcutsBtn).toBeVisible();

    await shortcutsBtn.click();
    await app.page.waitForTimeout(500);

    // The modal should show shortcut categories
    await expect(app.page.getByText('General Shortcuts')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('shortcuts modal displays all shortcut categories', async ({app}) => {
    // Modal should still be open from previous test
    const generalShortcuts = app.page.getByText('General Shortcuts');
    if (!(await generalShortcuts.isVisible())) {
      const shortcutsBtn = app.page.locator('button[title="View Shortcuts"]');
      await shortcutsBtn.click();
      await app.page.waitForTimeout(500);
    }

    await expect(app.page.getByText('General Shortcuts')).toBeVisible();
    await expect(app.page.getByText('Previewer Shorcuts')).toBeVisible();
  });

  test('shortcuts modal can be closed', async ({app}) => {
    // Modal should still be open
    const generalShortcuts = app.page.getByText('General Shortcuts');
    if (!(await generalShortcuts.isVisible())) {
      const shortcutsBtn = app.page.locator('button[title="View Shortcuts"]');
      await shortcutsBtn.click();
      await app.page.waitForTimeout(500);
    }

    // Click the Close button in the modal
    const closeBtn = app.page.getByText('Close');
    await closeBtn.click();
    await app.page.waitForTimeout(500);

    // Modal content should no longer be visible
    await expect(app.page.getByText('General Shortcuts')).not.toBeVisible({
      timeout: 5_000,
    });
  });

  test('Cmd/Ctrl+R reloads the page', async ({app}) => {
    await app.dismissModals();

    await expect(app.firstWebview).toBeAttached({timeout: 10_000});

    // Trigger reload via keyboard
    await app.pressShortcut('r');
    await app.page.waitForTimeout(2000);

    // Webview should still be attached after reload
    await expect(app.firstWebview).toBeAttached();
  });

  test('Cmd/Ctrl+L focuses the address bar', async ({app}) => {
    await app.dismissModals();

    await app.pressShortcut('l');
    await app.page.waitForTimeout(300);

    const isFocused = await app.page.evaluate(() => {
      const el = document.querySelector('[data-testid="address-bar"]');
      return document.activeElement === el;
    });
    expect(isFocused).toBe(true);
  });
});
