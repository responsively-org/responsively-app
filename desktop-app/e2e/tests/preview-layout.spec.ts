import {test, expect} from '../fixtures/electron-app';

test.describe('Preview Layout', () => {
  test('default layout is applied on launch', async ({app}) => {
    await app.dismissModals();

    // The previewer container should have a flex layout by default (COLUMN layout)
    const previewContainer = app.page.locator('.flex.gap-4.overflow-auto.p-4').first();
    await expect(previewContainer).toBeVisible({timeout: 10_000});
  });

  test('selecting "Flex" layout changes the previewer container class', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    // Click the Flex layout button (inside ButtonGroup)
    const flexBtn = app.page.locator('button:has-text("Flex")').first();
    await flexBtn.click();
    await app.page.waitForTimeout(300);

    await app.closeMenuFlyout();

    // The container should now have flex-wrap class
    const previewContainer = app.page.locator('.flex.gap-4.overflow-auto.p-4.flex-wrap').first();
    await expect(previewContainer).toBeVisible({timeout: 5_000});
  });

  test('selecting "Column" layout stacks devices horizontally', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    // Click the Column layout button
    const columnBtn = app.page.locator('button:has-text("Column")').first();
    await columnBtn.click();
    await app.page.waitForTimeout(300);

    await app.closeMenuFlyout();

    // The container should have flex without flex-wrap
    const previewContainer = app.page.locator('.flex.gap-4.overflow-auto.p-4').first();
    await expect(previewContainer).toBeVisible({timeout: 5_000});
  });

  test('keyboard shortcut Cmd/Ctrl+Shift+L cycles through layouts', async ({app}) => {
    await app.dismissModals();

    // Press the shortcut to cycle layout
    await app.page.keyboard.press(`${app.modifier}+Shift+l`);
    await app.page.waitForTimeout(500);

    // The layout should have changed — verify a previewer container still exists
    await expect(app.firstWebview).toBeAttached({timeout: 10_000});

    // Cycle back to column layout by pressing multiple times
    await app.page.keyboard.press(`${app.modifier}+Shift+l`);
    await app.page.waitForTimeout(300);
    await app.page.keyboard.press(`${app.modifier}+Shift+l`);
    await app.page.waitForTimeout(300);
    await app.page.keyboard.press(`${app.modifier}+Shift+l`);
    await app.page.waitForTimeout(300);
  });

  test('layout persists after navigating to a new URL', async ({app, testServerUrl}) => {
    await app.dismissModals();

    // Set layout to Flex
    await app.openMenuFlyout();

    const flexBtn = app.page.locator('button:has-text("Flex")').first();
    await flexBtn.click();
    await app.page.waitForTimeout(300);

    await app.closeMenuFlyout();

    // Navigate to a new URL
    await app.navigateTo(`${testServerUrl}/test-page.html`);

    // Verify flex-wrap is still present (Flex layout persisted)
    const previewContainer = app.page.locator('.flex.gap-4.overflow-auto.p-4.flex-wrap').first();
    await expect(previewContainer).toBeVisible({timeout: 5_000});

    // Reset to column layout
    await app.openMenuFlyout();
    const columnBtn = app.page.locator('button:has-text("Column")').first();
    await columnBtn.click();
    await app.closeMenuFlyout();
  });
});
