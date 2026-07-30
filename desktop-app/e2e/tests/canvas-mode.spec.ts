import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {expect, test} from '../fixtures/electron-app';
import type {ResponsivelyApp} from '../models/app';

const DEFAULT_DEVICE_IDS = ['10008', '10013', '10015'];
// Six devices for the perf spike: three phones, two tablets, one laptop.
const SPIKE_DEVICE_IDS = ['10008', '10006', '10016', '10013', '10011', '10015'];

const setSuiteDevices = async (mcpPort: number, deviceIds: string[]) => {
  const client = new Client({name: 'canvas-e2e', version: '1.0.0'});
  const transport = new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${mcpPort}/mcp`));
  await client.connect(transport);
  await client.callTool({name: 'set_active_devices', arguments: {devices: deviceIds}});
  await client.close();
};

const guestIds = (app: ResponsivelyApp): Promise<number[]> =>
  app.electronApp.evaluate(({webContents}) =>
    webContents
      .getAllWebContents()
      .filter(
        (wc: Electron.WebContents) => (wc as unknown as {getType(): string}).getType() === 'webview'
      )
      .map((wc: Electron.WebContents) => wc.id)
      .sort((a: number, b: number) => a - b)
  );

test.describe('Canvas mode', () => {
  test.afterAll(async ({app, mcpPort}) => {
    // Worker-scoped app: restore a grid layout and the default suite for
    // whatever spec file runs next.
    await app.page.locator('[data-testid="layout-FLEX"]').click();
    await setSuiteDevices(mcpPort, DEFAULT_DEVICE_IDS);
  });

  test('entering canvas keeps every webview alive (no remount)', async ({app}) => {
    await app.dismissModals();
    await app.page.locator('[data-testid="layout-COLUMN"]').click();
    const before = await guestIds(app);
    expect(before.length).toBeGreaterThan(0);

    await app.page.locator('[data-testid="layout-CANVAS"]').click();
    await expect(app.page.locator('[data-testid="canvas-stage"]')).toBeVisible();
    // The world is a zero-sized transform anchor — "visible" never applies.
    await expect(app.page.locator('[data-testid="canvas-world"]')).toBeAttached();

    // Identical webContents ids prove the switch reused the mounted guests.
    expect(await guestIds(app)).toEqual(before);
  });

  test('dragging the backdrop pans the world', async ({app}) => {
    await app.dismissModals();
    await app.page.locator('[data-testid="layout-CANVAS"]').click();

    const world = app.page.locator('[data-testid="canvas-world"]');
    const before = await world.evaluate((el) => el.style.transform);

    const stage = app.page.locator('[data-testid="canvas-stage"]');
    const box = await stage.boundingBox();
    // The top strip is backdrop: devices start at world y=40 and the control
    // cluster sits at the bottom of the stage.
    const startX = box!.x + box!.width / 2;
    const startY = box!.y + 10;
    await app.page.mouse.move(startX, startY);
    await app.page.mouse.down();
    await app.page.mouse.move(startX - 120, startY - 80, {steps: 5});
    await app.page.mouse.up();

    const after = await world.evaluate((el) => el.style.transform);
    expect(after).not.toBe(before);
    expect(after).toContain('translate(-120px, -80px)');
  });

  test('the status bar stepper drives canvas zoom', async ({app}) => {
    await app.dismissModals();
    // Device zoom is worker state another spec may have changed — capture it
    // rather than assuming the boot value.
    await app.page.locator('[data-testid="layout-COLUMN"]').click();
    const zoomLevel = app.page.locator('[data-testid="zoom-level"]');
    const deviceZoomText = await zoomLevel.innerText();

    await app.page.locator('[data-testid="layout-CANVAS"]').click();
    await expect(zoomLevel).toHaveText('90%');

    await app.page.locator('[data-testid="zoom-in"]').click();
    await expect(zoomLevel).toHaveText('100%');
    await expect
      .poll(() =>
        app.page.locator('[data-testid="canvas-world"]').evaluate((el) => el.style.transform)
      )
      .toContain('scale(1)');

    await app.page.locator('[data-testid="zoom-out"]').click();
    await expect(zoomLevel).toHaveText('90%');

    // Leaving canvas restores the device zoom readout.
    await app.page.locator('[data-testid="layout-COLUMN"]').click();
    await expect(zoomLevel).toHaveText(deviceZoomText);
  });

  test('spike: pan frame timing with six devices', async ({app, mcpPort}) => {
    await app.dismissModals();
    await setSuiteDevices(mcpPort, SPIKE_DEVICE_IDS);
    await app.page.locator('[data-testid="layout-CANVAS"]').click();
    await expect.poll(async () => (await guestIds(app)).length, {timeout: 20_000}).toBe(6);
    // Let the new guests finish their initial load before measuring.
    await app.page.waitForTimeout(3000);

    const timings = await app.page.evaluate(async () => {
      const world = document.querySelector('[data-testid="canvas-world"]') as HTMLElement;
      const deltas: number[] = [];
      let last = performance.now();
      for (let frame = 0; frame < 90; frame += 1) {
        world.style.transform = `translate(${frame * 6}px, ${frame * 3}px) scale(0.9)`;

        await new Promise(requestAnimationFrame);
        const now = performance.now();
        deltas.push(now - last);
        last = now;
      }
      const sorted = [...deltas].sort((a, b) => a - b);
      return {
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        max: sorted[sorted.length - 1],
      };
    });

    console.log(
      `SPIKE 6-device pan: p50=${timings.p50.toFixed(1)}ms p95=${timings.p95.toFixed(1)}ms max=${timings.max.toFixed(1)}ms`
    );

    // Informational threshold: generous enough for CI, tight enough to catch
    // the compositing-chokes failure mode the spike exists to detect.
    expect(timings.p95).toBeLessThan(100);
  });

  test('dragging a device by its label moves and persists its position', async ({app}) => {
    await app.dismissModals();
    await app.page.locator('[data-testid="layout-CANVAS"]').click();

    const firstItem = app.page.locator('[data-canvas-item]').first();
    const deviceId = await firstItem.getAttribute('data-canvas-item');
    const label = firstItem.locator('[data-device-label]');

    const before = await firstItem.evaluate((el) => ({
      left: (el as HTMLElement).style.left,
      top: (el as HTMLElement).style.top,
    }));

    const box = await label.boundingBox();
    await app.page.mouse.move(box!.x + 10, box!.y + 5);
    await app.page.mouse.down();
    await app.page.mouse.move(box!.x + 10 + 90, box!.y + 5 + 45, {steps: 5});
    await app.page.mouse.up();

    const after = await firstItem.evaluate((el) => ({
      left: (el as HTMLElement).style.left,
      top: (el as HTMLElement).style.top,
    }));
    expect(after).not.toEqual(before);

    // The position survives leaving and re-entering canvas (per-suite store).
    await app.page.locator('[data-testid="layout-COLUMN"]').click();
    await app.page.locator('[data-testid="layout-CANVAS"]').click();
    const restored = await app.page.locator(`[data-canvas-item="${deviceId}"]`).evaluate((el) => ({
      left: (el as HTMLElement).style.left,
      top: (el as HTMLElement).style.top,
    }));
    expect(restored).toEqual(after);

    // Arrange returns to the computed layout.
    await app.page.locator('button[title="Auto-arrange"]').click();
    const arranged = await app.page.locator(`[data-canvas-item="${deviceId}"]`).evaluate((el) => ({
      left: (el as HTMLElement).style.left,
      top: (el as HTMLElement).style.top,
    }));
    expect(arranged).toEqual(before);
  });

  test('present mode hides the chrome and Esc restores it', async ({app}) => {
    await app.dismissModals();
    await app.page.locator('[data-testid="layout-CANVAS"]').click();

    await app.page.locator('[data-testid="present-button"]').click();

    // All three chrome bars disappear; the canvas and exit pill remain.
    await expect(app.page.locator('[data-testid="status-bar"]')).toBeHidden();
    await expect(app.addressBar).toBeHidden();
    await expect(app.page.locator('[data-testid="title-bar"]')).toBeHidden();
    await expect(app.page.locator('[data-testid="canvas-stage"]')).toBeVisible();
    await expect(app.page.locator('[data-testid="exit-present"]')).toBeVisible();

    await app.page.keyboard.press('Escape');

    await expect(app.page.locator('[data-testid="status-bar"]')).toBeVisible();
    await expect(app.addressBar).toBeVisible();
    await expect(app.page.locator('[data-testid="exit-present"]')).toBeHidden();
  });

  test('the exit pill leaves present mode', async ({app}) => {
    await app.dismissModals();
    await app.page.locator('[data-testid="layout-CANVAS"]').click();
    await app.page.locator('[data-testid="present-button"]').click();

    await app.page.locator('[data-testid="exit-present"]').click();

    await expect(app.page.locator('[data-testid="status-bar"]')).toBeVisible();
  });

  test('view options toggle bezels, names and resolutions', async ({app}) => {
    await app.dismissModals();
    await app.page.locator('[data-testid="layout-CANVAS"]').click();

    await app.page.locator('button[title="View options"]').click();

    // Bezels off by default; toggling draws hardware frames.
    await expect(app.page.locator('[data-bezel]')).toHaveCount(0);
    await app.page.getByRole('button', {name: 'Device frames'}).click();
    expect(await app.page.locator('[data-bezel]').count()).toBeGreaterThan(0);
    await app.page.getByRole('button', {name: 'Device frames'}).click();
    await expect(app.page.locator('[data-bezel]')).toHaveCount(0);

    // Hiding names empties the labels but keeps the drag handles.
    const firstLabel = app.page.locator('[data-device-label]').first();
    await expect(firstLabel.locator('span.font-bold').first()).toBeVisible();
    await app.page.getByRole('button', {name: 'Device names'}).click();
    await expect(firstLabel.locator('span.font-bold')).toHaveCount(0);
    await expect(firstLabel).toBeAttached();
    await app.page.getByRole('button', {name: 'Device names'}).click();

    await app.page.keyboard.press('Escape');
  });

  test('clicking a label moves the selection and reveals that pill', async ({app}) => {
    await app.dismissModals();
    await app.page.locator('[data-testid="layout-CANVAS"]').click();

    // Selection is sticky worker state (the drag test selects device 1), so
    // assert on the transition: select device 2 and both pills must swap.
    const firstPill = app.page
      .locator('[data-canvas-item]')
      .first()
      .locator('[data-testid="device-pill"]');
    const secondItem = app.page.locator('[data-canvas-item]').nth(1);
    const secondPill = secondItem.locator('[data-testid="device-pill"]');

    const label = secondItem.locator('[data-device-label]');
    const box = await label.boundingBox();
    await app.page.mouse.click(box!.x + 8, box!.y + 4);

    await expect.poll(() => secondPill.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    // Park the pointer on the backdrop so hover doesn't keep pill 1 revealed.
    await app.page.mouse.move(5, 5);
    await expect.poll(() => firstPill.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
  });

  test('a per-device simulation shows a badge in the label', async ({app}) => {
    await app.dismissModals();
    await app.page.locator('[data-testid="layout-COLUMN"]').click();

    // The device pill reveals on hover; use the first device's sim dropdown.
    const firstDevice = app.page.locator('[data-testid="device-pill"]').first();
    await firstDevice.locator('button[title="Vision simulation"]').click({force: true});
    await app.page.getByRole('button', {name: 'deuteranopia'}).first().click();

    await expect(app.page.locator('[data-testid="sim-badge"]').first()).toHaveText('deuteranopia', {
      timeout: 10_000,
    });

    // Clear it for the next spec file.
    await firstDevice.locator('button[title="Vision simulation"]').click({force: true});
    await app.page.getByRole('button', {name: 'Disable tool'}).first().click();
    await expect(app.page.locator('[data-testid="sim-badge"]')).toHaveCount(0);
  });
});
