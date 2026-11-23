import {test, expect} from '../fixtures/electron-app';

test.describe('Toolbar responsiveness', () => {
  // The top toolbar must never push its last control (the "more" menu) past the
  // right edge of the window: when space is tight the action labels collapse to
  // icons instead of overflowing.
  for (const width of [1440, 1280, 1100]) {
    test(`keeps every control inside the window at ${width}px wide`, async ({app, electronApp}) => {
      await electronApp.evaluate(({BrowserWindow}, w) => {
        BrowserWindow.getAllWindows()[0]?.setBounds({x: 0, y: 0, width: w, height: 800});
      }, width);
      await app.dismissModals();

      const menuButton = app.page.getByTestId('menu-button');
      await expect(menuButton).toBeVisible();

      const box = await menuButton.boundingBox();
      const viewportWidth = await app.page.evaluate(() => window.innerWidth);

      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewportWidth);
    });
  }
});
