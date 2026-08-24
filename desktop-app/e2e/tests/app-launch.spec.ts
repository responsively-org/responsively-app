import {test, expect} from '../fixtures/electron-app';

test.describe('App Launch', () => {
  test('window is created and visible', async ({electronApp, mainWindow}) => {
    const isVisible = await electronApp.evaluate(({BrowserWindow}) => {
      const win = BrowserWindow.getAllWindows()[0];
      return win?.isVisible() ?? false;
    });
    if (process.env.E2E_HEADLESS === 'true') {
      expect(isVisible).toBe(false);
    } else {
      expect(isVisible).toBe(true);
    }
  });

  test('app name is ResponsivelyApp', async ({electronApp, mainWindow}) => {
    const name = await electronApp.evaluate(async ({app}) => {
      return app.getName();
    });
    expect(name).toBe('ResponsivelyApp');
  });

  test('toolbar renders with navigation buttons', async ({mainWindow}) => {
    await expect(mainWindow.locator('[data-testid="nav-back"]')).toBeVisible();
    await expect(mainWindow.locator('[data-testid="nav-forward"]')).toBeVisible();
    await expect(mainWindow.locator('[data-testid="nav-refresh"]')).toBeVisible();
  });

  test('address bar is visible with default homepage', async ({mainWindow}) => {
    const addressBar = mainWindow.locator('[data-testid="address-bar"]');
    await expect(addressBar).toBeVisible();

    const value = await addressBar.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('at least one webview is attached', async ({mainWindow}) => {
    const webviews = mainWindow.locator('webview');
    await expect(webviews.first()).toBeAttached({timeout: 15_000});
  });
});
