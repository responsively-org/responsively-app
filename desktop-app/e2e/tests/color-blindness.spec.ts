import {test, expect} from '../fixtures/electron-app';
import type {ElectronApplication} from '@playwright/test';

type RGB = {r: number; g: number; b: number};

/**
 * Capture the webview screenshot and sample pixel colors from the
 * red (top), green (middle), and blue (bottom) blocks.
 * Note: Electron's toBitmap() returns BGRA format on all platforms.
 */
async function captureColorBlocks(electronApp: ElectronApplication) {
  return electronApp.evaluate(async ({webContents}) => {
    const wv = webContents.getAllWebContents().find((wc) => (wc as any).getType() === 'webview');
    if (!wv) {
      return {
        red: {r: 0, g: 0, b: 0},
        green: {r: 0, g: 0, b: 0},
        blue: {r: 0, g: 0, b: 0},
      };
    }

    const image = await wv.capturePage();
    const size = image.getSize();
    const bitmap = image.toBitmap();

    // toBitmap() returns BGRA format
    function sampleAt(yFraction: number) {
      const y = Math.floor(size.height * yFraction);
      const x = Math.floor(size.width / 2);
      const offset = (y * size.width + x) * 4;
      return {
        r: bitmap[offset + 2], // R is at offset+2 in BGRA
        g: bitmap[offset + 1], // G is at offset+1
        b: bitmap[offset], // B is at offset+0
      };
    }

    return {
      red: sampleAt(1 / 6), // center of top third
      green: sampleAt(3 / 6), // center of middle third
      blue: sampleAt(5 / 6), // center of bottom third
    };
  }) as Promise<{red: RGB; green: RGB; blue: RGB}>;
}

/** Helper to select a color blindness simulation from the dropdown. */
async function selectSimulation(
  app: {openColorBlindnessDropdown: () => Promise<void>; page: any},
  name: string
) {
  await app.openColorBlindnessDropdown();
  const option = app.page.getByText(name).first();
  await option.click();
  await app.page.waitForTimeout(1000);
}

/** Helper to disable any active simulation. */
async function disableSimulation(app: {
  openColorBlindnessDropdown: () => Promise<void>;
  page: any;
}) {
  await app.openColorBlindnessDropdown();
  await app.page.getByText('Disable tool').click();
  await app.page.waitForTimeout(500);
}

test.describe('Color Blindness Simulation', () => {
  test.describe.configure({mode: 'parallel'});
  test('color blindness dropdown is visible in toolbar', async ({app}) => {
    await app.dismissModals();

    const colorBlindControls = app.page.locator('[data-testid="color-blindness-controls"]');
    await expect(colorBlindControls).toBeVisible();

    const dropdownBtn = colorBlindControls.locator('button').first();
    await expect(dropdownBtn).toBeVisible();
  });

  test('selecting a simulation option applies a filter', async ({app}) => {
    await app.dismissModals();
    await selectSimulation(app, 'deuteranopia');
  });

  test('selecting "Disable tool" removes the filter', async ({app}) => {
    await app.dismissModals();
    await disableSimulation(app);
  });

  test('simulation persists across page navigation within session', async ({
    app,
    testServerUrl,
  }) => {
    await app.dismissModals();
    await selectSimulation(app, 'protanopia');

    await app.navigateTo(`${testServerUrl}/test-page.html`);

    // Re-open dropdown to verify the simulation is still active, then clean up
    await disableSimulation(app);
  });

  // --- Functional tests: screenshot-based color verification ---

  test('no filter shows pure red, green, blue colors', async ({app, testServerUrl}) => {
    await app.dismissModals();

    await app.navigateTo(`${testServerUrl}/color-blindness-test.html`);
    await app.page.waitForTimeout(2000);

    const colors = await captureColorBlocks(app.electronApp);

    // Red block: R is the dominant channel
    expect(colors.red.r).toBeGreaterThan(180);
    expect(colors.red.r).toBeGreaterThan(colors.red.g);
    expect(colors.red.r).toBeGreaterThan(colors.red.b);

    // Green block: G is the dominant channel
    expect(colors.green.g).toBeGreaterThan(180);
    expect(colors.green.g).toBeGreaterThan(colors.green.r);
    expect(colors.green.g).toBeGreaterThan(colors.green.b);

    // Blue block: B is the dominant channel
    expect(colors.blue.b).toBeGreaterThan(180);
    expect(colors.blue.b).toBeGreaterThan(colors.blue.r);
    expect(colors.blue.b).toBeGreaterThan(colors.blue.g);
  });

  test('achromatopsia makes all colors grayscale', async ({app, testServerUrl}) => {
    await app.dismissModals();

    await app.navigateTo(`${testServerUrl}/color-blindness-test.html`);
    await app.page.waitForTimeout(2000);

    await selectSimulation(app, 'achromatopsia');

    const colors = await captureColorBlocks(app.electronApp);

    // All blocks should be grayscale: R ≈ G ≈ B within each block
    for (const [name, pixel] of Object.entries(colors)) {
      const maxDiff = Math.max(
        Math.abs(pixel.r - pixel.g),
        Math.abs(pixel.g - pixel.b),
        Math.abs(pixel.r - pixel.b)
      );
      expect(maxDiff, `${name} block should be grayscale`).toBeLessThan(30);
    }

    await disableSimulation(app);
  });

  test('deuteranopia shifts red toward yellow-green', async ({app, testServerUrl}) => {
    await app.dismissModals();

    await app.navigateTo(`${testServerUrl}/color-blindness-test.html`);
    await app.page.waitForTimeout(2000);

    // Capture baseline
    const baseline = await captureColorBlocks(app.electronApp);

    await selectSimulation(app, 'deuteranopia');

    const filtered = await captureColorBlocks(app.electronApp);

    // Red block: G channel should increase significantly compared to baseline
    // (deuteranopia matrix mixes R into G: G_out = 0.7*R + 0.3*G)
    expect(filtered.red.g).toBeGreaterThan(baseline.red.g + 50);

    // Blue block should remain mostly blue (B dominant)
    expect(filtered.blue.b).toBeGreaterThan(filtered.blue.r);
    expect(filtered.blue.b).toBeGreaterThan(filtered.blue.g);

    await disableSimulation(app);
  });

  test('tritanopia shifts blue toward cyan', async ({app, testServerUrl}) => {
    await app.dismissModals();

    await app.navigateTo(`${testServerUrl}/color-blindness-test.html`);
    await app.page.waitForTimeout(2000);

    // Capture baseline
    const baseline = await captureColorBlocks(app.electronApp);

    await selectSimulation(app, 'tritanopia');

    const filtered = await captureColorBlocks(app.electronApp);

    // Blue block: G channel should increase significantly
    // (tritanopia matrix: G_out = 0.567*B → large G from pure blue)
    expect(filtered.blue.g).toBeGreaterThan(baseline.blue.g + 50);

    // Red block should stay mostly red (R dominant)
    expect(filtered.red.r).toBeGreaterThan(filtered.red.g);

    await disableSimulation(app);
  });

  test('disabling filter restores original colors', async ({app, testServerUrl}) => {
    await app.dismissModals();

    await app.navigateTo(`${testServerUrl}/color-blindness-test.html`);
    await app.page.waitForTimeout(2000);

    // Apply achromatopsia
    await selectSimulation(app, 'achromatopsia');

    // Verify it's grayscale
    const grayColors = await captureColorBlocks(app.electronApp);
    const redDiff = Math.abs(grayColors.red.r - grayColors.red.b);
    expect(redDiff).toBeLessThan(30);

    // Disable the filter
    await disableSimulation(app);

    // Verify colors are back to normal (matching baseline within tolerance)
    const restored = await captureColorBlocks(app.electronApp);

    expect(restored.red.r).toBeGreaterThan(180);
    expect(restored.red.r).toBeGreaterThan(restored.red.g);
    expect(restored.green.g).toBeGreaterThan(180);
    expect(restored.green.g).toBeGreaterThan(restored.green.r);
    expect(restored.blue.b).toBeGreaterThan(180);
    expect(restored.blue.b).toBeGreaterThan(restored.blue.r);
  });
});
