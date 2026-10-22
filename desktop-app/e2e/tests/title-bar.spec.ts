import {test, expect} from '../fixtures/electron-app';

test.describe('Title Bar', () => {
  // Only macOS runs frameless; Windows/Linux keep the native frame so their
  // application menu stays in its own bar below the title bar.
  test.skip(process.platform !== 'darwin', 'custom title bar is macOS-only');

  test('custom title bar sits at the top of a frameless window', async ({app}) => {
    await app.dismissModals();

    const titleBar = app.page.locator('[data-testid="title-bar"]');
    await expect(titleBar).toBeVisible();

    const box = await titleBar.boundingBox();
    expect(box).not.toBeNull();
    // The page fills the whole window, so our bar is the top-most chrome.
    expect(box!.y).toBe(0);
    expect(box!.height).toBe(38);
  });

  test('title bar is a window drag handle', async ({app}) => {
    const appRegion = await app.page.evaluate(() => {
      const el = document.querySelector('[data-testid="title-bar"]');
      return el === null ? null : getComputedStyle(el).getPropertyValue('-webkit-app-region');
    });
    expect(appRegion).toBe('drag');
  });

  test('toolbar renders below the title bar', async ({app}) => {
    await app.dismissModals();

    const titleBarBox = await app.page.locator('[data-testid="title-bar"]').boundingBox();
    const addressBarBox = await app.addressBar.boundingBox();

    expect(addressBarBox!.y).toBeGreaterThanOrEqual(titleBarBox!.y + titleBarBox!.height);
  });

  test('title bar shows the current page title', async ({app, testServerUrl}) => {
    await app.dismissModals();
    await app.navigateTo(`${testServerUrl}/test-page.html`);

    await expect(app.page.locator('[data-testid="title-bar"]')).toContainText('Responsively', {
      timeout: 15_000,
    });
  });
});
