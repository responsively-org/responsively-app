import {test, expect} from '../fixtures/electron-app';

/** Extract the numeric scale value from a webview's style attribute. */
async function getWebviewScale(webview: import('@playwright/test').Locator): Promise<number> {
  const style = await webview.getAttribute('style');
  const match = style?.match(/scale\(([^)]+)\)/);
  return match ? parseFloat(match[1]) : -1;
}

/** Read the data-scale-factor attribute from a webview. */
async function getDataScaleFactor(webview: import('@playwright/test').Locator): Promise<number> {
  const val = await webview.getAttribute('data-scale-factor');
  return val ? parseFloat(val) : -1;
}

test.describe('Zoom Controls', () => {
  test.describe.configure({mode: 'parallel'});

  test('zoom percentage is displayed in the menu flyout', async ({app}) => {
    await app.dismissModals();

    // Verify zoom section is visible with percentage
    await expect(app.page.locator('[data-testid="status-bar"]')).toBeVisible();
    // The zoom percentage should be visible (e.g., "100%")
    const zoomPercent = app.page.locator('[data-testid="zoom-level"]');
    await expect(zoomPercent.first()).toBeVisible();
  });

  test('clicking + increases zoom percentage', async ({app}) => {
    await app.dismissModals();

    // Get current zoom percentage
    const zoomPercent = app.page.locator('[data-testid="zoom-level"]');
    const initialText = await zoomPercent.innerText();
    const initialZoom = parseInt(initialText, 10);

    // Click + button to zoom in
    const zoomInBtn = app.page.locator('[data-testid="zoom-in"]');
    await zoomInBtn.click();
    await app.page.waitForTimeout(200);

    // Verify zoom increased
    const newText = await zoomPercent.innerText();
    const newZoom = parseInt(newText, 10);
    expect(newZoom).toBeGreaterThan(initialZoom);
  });

  test('clicking - decreases zoom percentage', async ({app}) => {
    await app.dismissModals();

    // Get current zoom percentage
    const zoomPercent = app.page.locator('[data-testid="zoom-level"]');
    const initialText = await zoomPercent.innerText();
    const initialZoom = parseInt(initialText, 10);

    // Click - button to zoom out
    const zoomOutBtn = app.page.locator('[data-testid="zoom-out"]');
    await zoomOutBtn.click();
    await app.page.waitForTimeout(200);

    // Verify zoom decreased
    const newText = await zoomPercent.innerText();
    const newZoom = parseInt(newText, 10);
    expect(newZoom).toBeLessThan(initialZoom);
  });

  test('zoom in via keyboard shortcut (Cmd/Ctrl+=)', async ({app}) => {
    await app.dismissModals();

    // Open menu to see current zoom

    const zoomPercent = app.page.locator('[data-testid="zoom-level"]');
    const initialText = await zoomPercent.innerText();
    const initialZoom = parseInt(initialText, 10);

    // Close menu first so keyboard shortcut works

    // Use keyboard shortcut to zoom in
    await app.pressShortcut('=');
    await app.page.waitForTimeout(300);

    // Re-open menu to verify

    const newText = await zoomPercent.innerText();
    const newZoom = parseInt(newText, 10);
    expect(newZoom).toBeGreaterThan(initialZoom);
  });

  test('zoom out via keyboard shortcut (Cmd/Ctrl+-)', async ({app}) => {
    await app.dismissModals();

    const zoomPercent = app.page.locator('[data-testid="zoom-level"]');
    const initialText = await zoomPercent.innerText();
    const initialZoom = parseInt(initialText, 10);

    await app.pressShortcut('-');
    await app.page.waitForTimeout(300);

    const newText = await zoomPercent.innerText();
    const newZoom = parseInt(newText, 10);
    expect(newZoom).toBeLessThan(initialZoom);
  });

  test('zoom factor is applied to webview scale', async ({app}) => {
    await app.dismissModals();

    // The webview has a style transform with scale(zoomfactor)
    const transform = await app.firstWebview.getAttribute('style');

    // The style should contain a scale() transform
    expect(transform).toContain('scale(');
  });

  // --- Functional tests ---

  test('zooming in increases the webview scale transform value', async ({app}) => {
    await app.dismissModals();

    const scaleBefore = await getWebviewScale(app.firstWebview);
    expect(scaleBefore).toBeGreaterThan(0);

    // Zoom in
    await app.page.locator('[data-testid="zoom-in"]').click();
    await app.page.waitForTimeout(200);

    const scaleAfter = await getWebviewScale(app.firstWebview);
    expect(scaleAfter).toBeGreaterThan(scaleBefore);
  });

  test('zooming out decreases the webview scale transform value', async ({app}) => {
    await app.dismissModals();

    const scaleBefore = await getWebviewScale(app.firstWebview);
    expect(scaleBefore).toBeGreaterThan(0);

    // Zoom out
    await app.page.locator('[data-testid="zoom-out"]').click();
    await app.page.waitForTimeout(200);

    const scaleAfter = await getWebviewScale(app.firstWebview);
    expect(scaleAfter).toBeLessThan(scaleBefore);
  });

  test('data-scale-factor attribute matches the displayed zoom percentage', async ({app}) => {
    await app.dismissModals();

    const dataScale = await getDataScaleFactor(app.firstWebview);
    expect(dataScale).toBeGreaterThan(0);

    // Read displayed percentage from the menu
    const zoomPercent = app.page.locator('[data-testid="zoom-level"]');
    const displayedText = await zoomPercent.innerText();
    const displayedPercent = parseInt(displayedText, 10);

    // data-scale-factor * 100 should equal the displayed percentage
    // Math.ceil is used in the component: Math.ceil(zoomfactor * 100)
    expect(Math.ceil(dataScale * 100)).toBe(displayedPercent);
  });

  test('zoom in then zoom out returns to the original scale', async ({app}) => {
    await app.dismissModals();

    const originalScale = await getWebviewScale(app.firstWebview);

    // Zoom in
    await app.page.locator('[data-testid="zoom-in"]').click();
    await app.page.waitForTimeout(200);

    const zoomedScale = await getWebviewScale(app.firstWebview);
    expect(zoomedScale).not.toBeCloseTo(originalScale, 2);

    // Zoom back out
    await app.page.locator('[data-testid="zoom-out"]').click();
    await app.page.waitForTimeout(200);

    const restoredScale = await getWebviewScale(app.firstWebview);
    expect(restoredScale).toBeCloseTo(originalScale, 5);
  });

  test('webview container width changes with zoom', async ({app}) => {
    await app.dismissModals();

    // Get the container that wraps the webview (parent with overflow-hidden)
    const container = app.firstWebview.locator('..');
    const boxBefore = await container.boundingBox();
    expect(boxBefore).not.toBeNull();

    // Zoom in
    await app.page.locator('[data-testid="zoom-in"]').click();
    await app.page.waitForTimeout(300);

    const boxAfter = await container.boundingBox();
    expect(boxAfter).not.toBeNull();

    // Container width should grow after zooming in
    // (height may be constrained by the viewport)
    expect(boxAfter!.width).toBeGreaterThan(boxBefore!.width);
  });

  test('zoom cannot exceed maximum (200%)', async ({app}) => {
    await app.dismissModals();

    // Click + repeatedly until we hit the cap
    for (let i = 0; i < 15; i++) {
      await app.page.locator('[data-testid="zoom-in"]').click();
      await app.page.waitForTimeout(100);
    }

    const scale = await getDataScaleFactor(app.firstWebview);
    expect(scale).toBeLessThanOrEqual(2.0);

    // Verify the displayed percentage caps at 200%
    const zoomPercent = app.page.locator('[data-testid="zoom-level"]');
    const text = await zoomPercent.innerText();
    const percent = parseInt(text, 10);
    expect(percent).toBeLessThanOrEqual(200);
  });

  test('zoom cannot go below minimum (25%)', async ({app}) => {
    await app.dismissModals();

    // Click - repeatedly until we hit the floor
    for (let i = 0; i < 15; i++) {
      await app.page.locator('[data-testid="zoom-out"]').click();
      await app.page.waitForTimeout(100);
    }

    const scale = await getDataScaleFactor(app.firstWebview);
    expect(scale).toBeGreaterThanOrEqual(0.25);

    // Verify the displayed percentage floors at 25%
    const zoomPercent = app.page.locator('[data-testid="zoom-level"]');
    const text = await zoomPercent.innerText();
    const percent = parseInt(text, 10);
    expect(percent).toBeGreaterThanOrEqual(25);
  });
});
