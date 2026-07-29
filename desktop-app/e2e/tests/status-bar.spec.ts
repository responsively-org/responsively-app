import {test, expect} from '../fixtures/electron-app';

test.describe('Status Bar', () => {
  test('renders below the previews with the layout switcher and zoom stepper', async ({app}) => {
    await app.dismissModals();

    const statusBar = app.page.locator('[data-testid="status-bar"]');
    await expect(statusBar).toBeVisible();

    const statusBox = await statusBar.boundingBox();
    const previewBox = await app.firstWebview.boundingBox();
    expect(statusBox!.y).toBeGreaterThan(previewBox!.y);
    expect(Math.round(statusBox!.height)).toBe(38);

    await expect(app.page.locator('[data-testid="zoom-level"]')).toContainText('%');
  });

  test('layout switcher marks the active layout and switches on click', async ({app}) => {
    await app.dismissModals();

    const column = app.page.locator('[data-testid="layout-COLUMN"]');
    const flex = app.page.locator('[data-testid="layout-FLEX"]');

    await column.click();
    await expect(column).toHaveAttribute('aria-pressed', 'true');
    await expect(flex).toHaveAttribute('aria-pressed', 'false');

    await flex.click();
    await expect(flex).toHaveAttribute('aria-pressed', 'true');
    await expect(column).toHaveAttribute('aria-pressed', 'false');
  });

  test('status text reports the active suite', async ({app}) => {
    await app.dismissModals();

    await expect(app.page.locator('[data-testid="status-text"]')).toContainText('device');
  });

  test('notifications open from the status bar bell', async ({app}) => {
    await app.dismissModals();

    await app.page.locator('button[title="Notifications"]').click();
    await expect(app.page.getByText('Notifications').last()).toBeVisible({timeout: 5_000});

    await app.page.keyboard.press('Escape');
  });
});
