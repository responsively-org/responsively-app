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

const setDeviceFrames = async (app: ResponsivelyApp, enabled: boolean) => {
  await app.page.locator('button[title="View options"]').click();
  const toggle = app.page.getByRole('button', {name: 'Device frames', exact: true});
  if ((await toggle.getAttribute('aria-pressed')) !== String(enabled)) {
    await toggle.click();
  }
  await expect(toggle).toHaveAttribute('aria-pressed', String(enabled));
  await app.page.keyboard.press('Escape');
};

const runInGuests = (app: ResponsivelyApp, script: string) =>
  app.electronApp.evaluate(
    async ({webContents}, code) =>
      Promise.all(
        webContents
          .getAllWebContents()
          .filter(
            (wc: Electron.WebContents) =>
              (wc as unknown as {getType(): string}).getType() === 'webview'
          )
          .sort((a: Electron.WebContents, b: Electron.WebContents) => a.id - b.id)
          .map((wc: Electron.WebContents) => wc.executeJavaScript(code))
      ),
    script
  );

test.describe('Canvas mode', () => {
  test.afterAll(async ({app, mcpPort}) => {
    // Worker-scoped app: restore default frame visibility, a grid layout
    // and the default suite for whatever spec file runs next.
    await app.dismissModals();
    await app.page.locator('[data-testid="layout-CANVAS"]').click();
    await setDeviceFrames(app, true);
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
    // Canvas draws a frame for every device without opting into View options.
    await expect(app.page.locator('[data-bezel]')).toHaveCount(before.length);

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

  test('present mode hides the chrome and Esc restores it', async ({app, testServerUrl}) => {
    await app.dismissModals();
    await app.navigateTo(`${testServerUrl}/test-page.html`);
    await expect(app.addressBar).toHaveValue(/test-page\.html/, {timeout: 15_000});
    await app.page.locator('[data-testid="layout-CANVAS"]').click();

    await app.page.locator('[data-testid="present-button"]').click();

    // Toolbar and status bar disappear; the canvas and exit pill remain. The
    // title bar stays as the one piece of chrome, showing app — site — page.
    await expect(app.page.locator('[data-testid="status-bar"]')).toBeHidden();
    await expect(app.addressBar).toBeHidden();
    if (process.platform === 'darwin') {
      const titleBar = app.page.locator('[data-testid="title-bar"]');
      await expect(titleBar).toBeVisible();
      await expect(titleBar).toContainText('Responsively — 127.0.0.1');
    }
    await expect(app.page.locator('[data-testid="canvas-stage"]')).toBeVisible();
    await expect(app.page.locator('[data-testid="exit-present"]')).toBeVisible();
    // Per-device pills are chrome too — none of them render while presenting.
    await expect(app.page.locator('[data-testid="device-pill"]')).toHaveCount(0);

    await app.page.keyboard.press('Escape');

    await expect(app.page.locator('[data-testid="status-bar"]')).toBeVisible();
    await expect(app.addressBar).toBeVisible();
    await expect(app.page.locator('[data-testid="exit-present"]')).toBeHidden();
    await expect(app.page.locator('[data-testid="device-pill"]').first()).toBeAttached();
  });

  test('the exit pill auto-hides on an idle mouse and returns on movement', async ({app}) => {
    await app.dismissModals();
    await app.page.locator('[data-testid="layout-CANVAS"]').click();
    await app.page.locator('[data-testid="present-button"]').click();

    const pill = app.page.locator('[data-testid="exit-present"]');
    await expect(pill).toBeVisible();

    // Park the mouse on the stage's backdrop strip (over a webview the host
    // document would never see mousemove) and hold still past the idle delay:
    // the pill fades out (opacity 0 + pointer-events none, still in the DOM).
    const box = await app.page.locator('[data-testid="canvas-stage"]').boundingBox();
    await app.page.mouse.move(box!.x + box!.width / 2, box!.y + 10);
    await expect(pill).toHaveCSS('opacity', '0', {timeout: 5_000});
    await expect(pill).toHaveCSS('pointer-events', 'none');

    // Any movement brings it back immediately.
    await app.page.mouse.move(box!.x + box!.width / 2 + 40, box!.y + 12);
    await expect(pill).not.toHaveCSS('opacity', '0');

    await app.page.keyboard.press('Escape');
    await expect(app.page.locator('[data-testid="status-bar"]')).toBeVisible();
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

    // Frames start enabled; users can hide them and restore the default.
    const frameToggle = app.page.getByRole('button', {name: 'Device frames', exact: true});
    const deviceCount = await app.webviews.count();
    await expect(frameToggle).toHaveAttribute('aria-pressed', 'true');
    await expect(app.page.locator('[data-bezel]')).toHaveCount(deviceCount);
    await frameToggle.click();
    await expect(frameToggle).toHaveAttribute('aria-pressed', 'false');
    await expect(app.page.locator('[data-bezel]')).toHaveCount(0);
    await frameToggle.click();
    await expect(frameToggle).toHaveAttribute('aria-pressed', 'true');
    await expect(app.page.locator('[data-bezel]')).toHaveCount(deviceCount);

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
    await app.revealDevicePill();
    await firstDevice.locator('button[title="Simulate vision"]').click();
    await app.page.getByRole('button', {name: 'deuteranopia'}).first().click();

    await expect(app.page.locator('[data-testid="sim-badge"]').first()).toHaveText('deuteranopia', {
      timeout: 10_000,
    });

    // Clear it for the next spec file.
    await app.revealDevicePill();
    await firstDevice.locator('button[title="Simulate vision"]').click();
    await app.page.getByRole('button', {name: 'Disable tool'}).first().click();
    await expect(app.page.locator('[data-testid="sim-badge"]')).toHaveCount(0);
  });

  test.describe('real device artwork', () => {
    test.beforeEach(async ({app, mcpPort}) => {
      await app.dismissModals();
      // Earlier tests use six devices and retain view preferences in this
      // worker. Reset this coverage explicitly so it also runs on its own.
      await setSuiteDevices(mcpPort, DEFAULT_DEVICE_IDS);
      await expect(app.webviews).toHaveCount(3);
      await expect.poll(async () => (await guestIds(app)).length).toBe(3);
      await app.page.locator('[data-testid="layout-CANVAS"]').click();
      // Exercise adding artwork around guests that started without it.
      await setDeviceFrames(app, false);
      const rotateAll = app.page.locator('button[title="Rotate Devices"]');
      if ((await rotateAll.getAttribute('aria-pressed')) === 'true') {
        await rotateAll.click();
      }
      for (const rotate of await app.page.locator('button[title="Rotate this device"]').all()) {
        if ((await rotate.getAttribute('aria-pressed')) === 'true') {
          await rotate.focus();
          await rotate.click();
        }
      }
      for (const ruler of await app.page.locator('button[title="Show rulers"]').all()) {
        if ((await ruler.getAttribute('aria-pressed')) === 'true') {
          await ruler.focus();
          await ruler.click();
        }
      }
      await app.page.locator('button[title="Auto-arrange"]').click();
    });

    test.afterEach(async ({app}) => {
      await app.page.keyboard.press('Escape');
      await app.page.locator('[data-testid="layout-CANVAS"]').click();
      await setDeviceFrames(app, true);
      await app.page.locator('[data-testid="layout-COLUMN"]').click();
    });

    test('loads default artwork and preserves guest state through frame and layout changes', async ({
      app,
      testServerUrl,
    }) => {
      await app.page.locator('[data-testid="layout-COLUMN"]').click();
      await app.navigateTo(`${testServerUrl}/test-page.html`);
      await expect
        .poll(() => runInGuests(app, "Boolean(document.querySelector('#mirror-input'))"))
        .toEqual([true, true, true]);

      await runInGuests(
        app,
        `document.querySelector('#mirror-input').value = 'Keep my unfinished form';
         window.testClickCount = 7;
         window.frameRegressionMarker = 'same document';`
      );
      const ids = await guestIds(app);
      // BrowserSync mirrors scroll proportionally across unequal viewports.
      // Scroll once, then retain each guest's settled position as its baseline.
      await app.electronApp.evaluate(
        ({webContents}, id) => webContents.fromId(id)!.executeJavaScript('window.scrollTo(0, 400)'),
        ids[0]
      );
      let settledScroll: number[] = [];
      let stableSamples = 0;
      await expect
        .poll(
          async () => {
            const positions: number[] = await runInGuests(app, 'Math.round(window.scrollY)');
            stableSamples = positions.every(
              (position, index) => position > 0 && position === settledScroll[index]
            )
              ? stableSamples + 1
              : 0;
            settledScroll = positions;
            return stableSamples;
          },
          {intervals: [200, 300, 500]}
        )
        .toBeGreaterThanOrEqual(2);
      const readState = `({
        input: document.querySelector('#mirror-input').value,
        clicks: window.testClickCount,
        marker: window.frameRegressionMarker,
        scrollY: Math.round(window.scrollY)
      })`;
      const state = await runInGuests(app, readState);
      expect(state).toEqual(
        settledScroll.map((scrollY) => ({
          input: 'Keep my unfinished form',
          clicks: 7,
          marker: 'same document',
          scrollY,
        }))
      );

      await app.page.locator('[data-testid="layout-CANVAS"]').click();
      for (const enabled of [true, false, true]) {
        await setDeviceFrames(app, enabled);
        await expect(app.page.locator('[data-device-frame]')).toHaveCount(enabled ? 3 : 0);
        if (enabled) {
          for (const frameId of ['iphone-12-pro', 'ipad', 'laptop']) {
            const artwork = app.page.locator(`[data-device-frame="${frameId}"] > img`);
            await expect(artwork).toBeAttached();
            await expect
              .poll(() =>
                artwork.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)
              )
              .toBe(true);
          }
        }
        expect(await guestIds(app)).toEqual(ids);
        expect(await runInGuests(app, readState)).toEqual(state);
      }

      // Leaving Canvas removes the artwork; returning restores it around
      // the same browsing document, including unsaved page state.
      for (const layout of ['COLUMN', 'CANVAS']) {
        await app.page.locator(`[data-testid="layout-${layout}"]`).click();
        await expect(app.page.locator('[data-device-frame]')).toHaveCount(
          layout === 'CANVAS' ? 3 : 0
        );
        expect(await guestIds(app)).toEqual(ids);
        expect(await runInGuests(app, readState)).toEqual(state);
      }
    });

    test('rotates artwork, keeps rulers usable and scales the complete frame without remounting', async ({
      app,
    }) => {
      await setDeviceFrames(app, true);
      const phone = app.page.locator('[data-device-frame="iphone-12-pro"]');
      const image = phone.locator(':scope > img');
      const webview = phone.locator('webview');
      const ids = await guestIds(app);
      await expect
        .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBeGreaterThan(0);
      const portrait = await phone.boundingBox();
      expect(portrait!.height).toBeGreaterThan(portrait!.width);

      const rotateAll = app.page.locator('button[title="Rotate Devices"]');
      await rotateAll.click();
      await expect(image).toHaveCSS('transform', 'matrix(0, -1, 1, 0, 0, 0)');
      const landscape = await phone.boundingBox();
      expect(landscape!.width).toBeCloseTo(portrait!.height, 0);
      expect(landscape!.height).toBeCloseTo(portrait!.width, 0);
      await app.page.locator('button[title="Auto-arrange"]').click();
      const frames = await app.page.locator('[data-device-frame]').evaluateAll((elements) =>
        elements.map((element) => {
          const {left, top, right, bottom} = element.getBoundingClientRect();
          return {left, top, right, bottom};
        })
      );
      for (let i = 0; i < frames.length; i += 1) {
        for (let j = i + 1; j < frames.length; j += 1) {
          const a = frames[i];
          const b = frames[j];
          expect(
            a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top
          ).toBe(true);
        }
      }
      expect(await guestIds(app)).toEqual(ids);
      await rotateAll.click();
      await expect(image).toHaveCSS('transform', 'none');

      const rulers = app.page.locator('[data-canvas-item="10008"] button[title="Show rulers"]');
      await rulers.focus();
      await rulers.click();
      await expect(rulers).toHaveAttribute('aria-pressed', 'true');
      await expect(phone.locator('canvas')).toHaveCount(2);
      await expect(webview).toHaveCSS('margin-left', '30px');
      await expect(webview).toHaveCSS('margin-top', '30px');
      // The notch stays above the page while guides sit above the artwork.
      await expect(image).toHaveCSS('z-index', '2');
      const guideLayer = phone
        .locator('[data-scaled-frame] > div')
        .filter({has: app.page.locator('canvas')});
      await expect(guideLayer).toHaveCSS('z-index', '3');
      await expect(phone.locator('[data-scaled-frame]')).toHaveCSS('border-radius', '0px');
      const label = await app.page
        .locator('[data-canvas-item="10008"] [data-device-label]')
        .boundingBox();
      for (const rulerCanvas of await phone.locator('canvas').all()) {
        const box = await rulerCanvas.boundingBox();
        expect(box!.y).toBeGreaterThanOrEqual(label!.y + label!.height - 0.5);
      }
      expect(await guestIds(app)).toEqual(ids);
      await rulers.click();
      await expect(phone.locator('canvas')).toHaveCount(0);
      await expect(image).toHaveCSS('z-index', '2');

      const frameBefore = await phone.boundingBox();
      const screenBefore = await webview.boundingBox();
      const zoom = Number.parseInt(
        await app.page.locator('[data-testid="zoom-level"]').innerText(),
        10
      );
      // Choose a direction away from the limit if another test changed zoom.
      const zoomDirection = zoom > 25 ? 'out' : 'in';
      await app.page.locator(`[data-testid="zoom-${zoomDirection}"]`).click();
      await expect(app.page.locator('[data-testid="zoom-level"]')).not.toHaveText(`${zoom}%`);
      const frameAfter = await phone.boundingBox();
      const screenAfter = await webview.boundingBox();
      expect(frameAfter!.width).not.toBe(frameBefore!.width);
      expect(frameAfter!.width / frameBefore!.width).toBeCloseTo(
        screenAfter!.width / screenBefore!.width,
        4
      );
      expect(frameAfter!.height / frameBefore!.height).toBeCloseTo(
        screenAfter!.height / screenBefore!.height,
        4
      );
      expect(await guestIds(app)).toEqual(ids);
      await app.page
        .locator(`[data-testid="zoom-${zoomDirection === 'out' ? 'in' : 'out'}"]`)
        .click();
    });
  });
});
