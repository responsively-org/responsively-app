import {expect, test} from '../fixtures/electron-app';
import type {ResponsivelyApp} from '../models/app';

const scaleOf = (transform: string): number => {
  const match = transform.match(/scale\(([\d.]+)\)/);
  return match ? parseFloat(match[1]) : NaN;
};

/**
 * Real ctrl+wheel into a guest page — exercises the preload forwarding path.
 * `deltaY` uses DOM wheel semantics (negative = pinch out / zoom in); Electron's
 * sendInputEvent wheel deltas are sign-inverted, hence the flip below.
 */
const pinchGuest = async (app: ResponsivelyApp, deltaY: number, times: number) => {
  await app.electronApp.evaluate(
    ({webContents}, args) => {
      const guest = webContents
        .getAllWebContents()
        .filter(
          (wc: Electron.WebContents) =>
            (wc as unknown as {getType(): string}).getType() === 'webview'
        )
        .sort((a: Electron.WebContents, b: Electron.WebContents) => a.id - b.id)[0];
      for (let i = 0; i < args.times; i += 1) {
        guest.sendInputEvent({
          type: 'mouseWheel',
          x: 50,
          y: 50,
          deltaX: 0,
          deltaY: -args.deltaY,
          modifiers: ['control'],
        });
      }
    },
    {deltaY, times}
  );
};

test.describe('Pinch zoom', () => {
  test.afterAll(async ({app}) => {
    // Worker-scoped app: leave a grid layout for whatever spec runs next.
    await app.page.locator('[data-testid="layout-FLEX"]').click();
  });

  test('ctrl+wheel over the preview area steps the zoom in grid layouts', async ({app}) => {
    await app.dismissModals();
    await app.page.locator('[data-testid="layout-FLEX"]').click();

    const zoomLevel = app.page.locator('[data-testid="zoom-level"]');
    const before = parseInt(await zoomLevel.innerText(), 10);

    // Pinch over host DOM, not a webview: the strip just above the first
    // scaled frame is the device's label row, which bubbles to the stage.
    const frame = await app.page.locator('[data-scaled-frame]').first().boundingBox();
    await app.page.mouse.move(frame!.x + frame!.width / 2, frame!.y - 30);
    await app.page.keyboard.down('Control');
    await app.page.mouse.wheel(0, -60);
    await app.page.mouse.wheel(0, -60);
    await app.page.keyboard.up('Control');

    await expect
      .poll(async () => parseInt(await zoomLevel.innerText(), 10))
      .toBeGreaterThan(before);

    // Symmetric pinch-out restores the previous step for the next spec.
    await app.page.keyboard.down('Control');
    await app.page.mouse.wheel(0, 60);
    await app.page.mouse.wheel(0, 60);
    await app.page.keyboard.up('Control');
    await expect.poll(async () => parseInt(await zoomLevel.innerText(), 10)).toBe(before);
  });

  test('canvas pinch zooms the world toward the cursor, plain wheel still pans', async ({app}) => {
    await app.dismissModals();
    await app.page.locator('[data-testid="layout-CANVAS"]').click();
    const world = app.page.locator('[data-testid="canvas-world"]');
    const stage = app.page.locator('[data-testid="canvas-stage"]');
    await expect(stage).toBeVisible();

    const startScale = scaleOf(await world.evaluate((el) => el.style.transform));
    expect(startScale).not.toBeNaN();

    const box = await stage.boundingBox();
    await app.page.mouse.move(box!.x + box!.width / 2, box!.y + 10);
    await app.page.keyboard.down('Control');
    await app.page.mouse.wheel(0, -100);
    await app.page.keyboard.up('Control');

    await expect
      .poll(async () => scaleOf(await world.evaluate((el) => el.style.transform)))
      .toBeGreaterThan(startScale);

    // Plain wheel keeps panning: translate changes, scale holds.
    const zoomed = await world.evaluate((el) => el.style.transform);
    await app.page.mouse.wheel(0, 40);
    await expect.poll(async () => world.evaluate((el) => el.style.transform)).not.toBe(zoomed);
    expect(scaleOf(await world.evaluate((el) => el.style.transform))).toBe(scaleOf(zoomed));

    // Reset view for the specs that follow (zoom 0.9, pan 0).
    await app.page.getByRole('button', {name: 'Reset', exact: true}).click();
    await expect
      .poll(async () => scaleOf(await world.evaluate((el) => el.style.transform)))
      .toBe(0.9);
  });

  test('a pinch over the webview itself zooms via the guest forward', async ({
    app,
    testServerUrl,
  }) => {
    await app.dismissModals();
    await app.navigateTo(`${testServerUrl}/test-page.html`);
    await expect(app.addressBar).toHaveValue(/test-page\.html/, {timeout: 15_000});
    await app.page.locator('[data-testid="layout-FLEX"]').click();

    const zoomLevel = app.page.locator('[data-testid="zoom-level"]');
    const before = parseInt(await zoomLevel.innerText(), 10);

    await pinchGuest(app, -60, 2);
    await expect
      .poll(async () => parseInt(await zoomLevel.innerText(), 10))
      .toBeGreaterThan(before);

    await pinchGuest(app, 60, 2);
    await expect.poll(async () => parseInt(await zoomLevel.innerText(), 10)).toBe(before);
  });
});
