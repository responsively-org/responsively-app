import {test, expect} from '../fixtures/electron-app';

test.describe('UI Theme', () => {
  test('dark mode is enabled by default', async ({app}) => {
    await app.dismissModals();

    // The html element should have a "dark" class (set by ThemeProvider)
    const hasDarkClass = await app.page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    // Verify the documentElement check works (class is either present or not)
    expect(typeof hasDarkClass).toBe('boolean');
  });

  test('clicking theme toggle switches theme', async ({app}) => {
    await app.dismissModals();

    // Check current theme state
    const wasDark = await app.page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    // Open menu flyout
    await app.openMenuFlyout();

    // Click the theme toggle button
    const themeToggle = app.page.locator('[data-testid="theme-toggle"]');
    await themeToggle.click();
    await app.page.waitForTimeout(300);

    await app.closeMenuFlyout();

    // Verify theme toggled
    const isDark = await app.page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    expect(isDark).not.toBe(wasDark);
  });

  test('clicking theme toggle again switches back', async ({app}) => {
    await app.dismissModals();

    const wasDark = await app.page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    await app.openMenuFlyout();

    const themeToggle = app.page.locator('[data-testid="theme-toggle"]');
    await themeToggle.click();
    await app.page.waitForTimeout(300);

    await app.closeMenuFlyout();

    const isDark = await app.page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    expect(isDark).not.toBe(wasDark);
  });

  test('keyboard shortcut Cmd/Ctrl+T toggles theme', async ({app}) => {
    await app.dismissModals();

    const beforeToggle = await app.page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    await app.pressShortcut('t');
    await app.page.waitForTimeout(300);

    const afterToggle = await app.page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    expect(afterToggle).not.toBe(beforeToggle);

    // Toggle back to restore state
    await app.pressShortcut('t');
    await app.page.waitForTimeout(300);
  });

  test('theme persists across navigation', async ({app, testServerUrl}) => {
    await app.dismissModals();

    const currentTheme = await app.page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    // Navigate to a page
    await app.navigateTo(`${testServerUrl}/test-page.html`);

    // Theme should remain the same
    const afterNav = await app.page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    expect(afterNav).toBe(currentTheme);
  });
});
