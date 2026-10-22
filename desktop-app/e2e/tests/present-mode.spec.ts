import {test, expect} from '../fixtures/electron-app';
import type {ResponsivelyApp} from '../models/app';

const enterPresent = async (app: ResponsivelyApp) => {
  await app.page.locator('[data-testid="layout-CANVAS"]').click();
  await app.page.locator('[data-testid="present-button"]').click();
  await expect(app.page.locator('[data-testid="exit-present"]')).toBeVisible();
};

// Present mode hides the status bar (and with it the layout switcher), so a
// test that bails mid-way would strand the worker-shared app for the next
// spec — always leave through Escape.
const exitPresentIfActive = async (app: ResponsivelyApp) => {
  const pill = app.page.locator('[data-testid="exit-present"]');
  if ((await pill.count()) > 0) {
    await app.page.keyboard.press('Escape');
    await expect(pill).not.toBeAttached();
  }
};

test.describe('Present mode', () => {
  test.beforeEach(async ({app}) => {
    await app.dismissModals();
    await exitPresentIfActive(app);
  });

  test.afterAll(async ({app}) => {
    await exitPresentIfActive(app);
    await app.page.locator('[data-testid="layout-FLEX"]').click();
  });

  test('present button appears only in the canvas layout', async ({app}) => {
    await app.page.locator('[data-testid="layout-FLEX"]').click();
    await expect(app.page.locator('[data-testid="present-button"]')).not.toBeAttached();

    await app.page.locator('[data-testid="layout-CANVAS"]').click();
    await expect(app.page.locator('[data-testid="present-button"]')).toBeVisible();
  });

  test('presenting strips the chrome down to pure content', async ({app}) => {
    await enterPresent(app);

    await expect(app.page.locator('[data-testid="status-bar"]')).not.toBeAttached();
    await expect(app.addressBar).not.toBeAttached();
    await expect(app.page.locator('[data-testid="device-pill"]')).toHaveCount(0);
    await expect(app.page.locator('[data-testid="canvas-stage"]')).toBeVisible();

    if (process.platform === 'darwin') {
      // The frameless window's own title bar is the one piece of chrome that
      // stays (it still shows app, domain and page title while presenting).
      await expect(app.page.locator('[data-testid="title-bar"]')).toBeVisible();
    }
  });

  test('exit pill hides on idle mouse and returns on movement', async ({app}) => {
    await enterPresent(app);

    // Park the cursor on backdrop, away from the pill — a hovered pill
    // deliberately never hides.
    const stage = app.page.locator('[data-testid="canvas-stage"]');
    const box = await stage.boundingBox();
    await app.page.mouse.move(box!.x + box!.width / 2, box!.y + 20);

    const pill = app.page.locator('[data-testid="exit-present"]');
    // EXIT_PILL_IDLE_MS is 1500ms; the class flips first, then opacity fades.
    await expect(pill).toHaveClass(/opacity-0/, {timeout: 4000});

    await app.page.mouse.move(box!.x + box!.width / 2 + 40, box!.y + 40);
    await expect(pill).not.toHaveClass(/opacity-0/);
  });

  test('Escape exits present mode and restores the chrome', async ({app}) => {
    await enterPresent(app);

    await app.page.keyboard.press('Escape');

    await expect(app.page.locator('[data-testid="exit-present"]')).not.toBeAttached();
    await expect(app.page.locator('[data-testid="status-bar"]')).toBeVisible();
    await expect(app.addressBar).toBeVisible();
  });

  test('clicking the exit pill exits present mode', async ({app}) => {
    await enterPresent(app);

    await app.page.locator('[data-testid="exit-present"]').click();

    await expect(app.page.locator('[data-testid="exit-present"]')).not.toBeAttached();
    await expect(app.page.locator('[data-testid="status-bar"]')).toBeVisible();
  });
});
