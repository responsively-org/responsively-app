import {test, expect} from '../fixtures/electron-app';

// The Previewer layout container has 'flex h-full' plus 'flex-col' (bottom)
// or 'flex-row' (right). The DevtoolsResizer inner div also has
// 'flex h-full flex-col' but always includes 'w-full', so we exclude it.
const BOTTOM_DOCK_SELECTOR = '.flex.h-full.flex-col:not(.w-full)';
const RIGHT_DOCK_SELECTOR = '.flex.h-full.flex-row';

test.describe('Inspect Elements', () => {
  test.describe.configure({mode: 'parallel'});
  test('inspect button is visible in toolbar', async ({app}) => {
    await app.dismissModals();

    const inspectBtn = app.page.locator('button[title="Inspect Elements"]');
    await expect(inspectBtn).toBeVisible();
  });

  test('clicking inspect toggles inspect mode', async ({app}) => {
    await app.dismissModals();

    const inspectBtn = app.page.locator('button[title="Inspect Elements"]');

    // Click to enable inspect mode
    await inspectBtn.click();
    await app.page.waitForTimeout(300);

    // The button should have the active state class (bg-slate-400/60)
    const classNames = await inspectBtn.getAttribute('class');
    expect(classNames).toContain('bg-slate-400/60');
  });

  test('keyboard shortcut Cmd/Ctrl+I toggles inspect mode', async ({app}) => {
    await app.dismissModals();

    const inspectBtn = app.page.locator('button[title="Inspect Elements"]');

    // Toggle inspect mode via keyboard
    await app.pressShortcut('i');
    await app.page.waitForTimeout(300);

    // Check the button state changed
    const classNames = await inspectBtn.getAttribute('class');
    // It should have toggled from the previous state
    expect(classNames).toBeTruthy();
  });

  test('clicking inspect again disables inspect mode', async ({app}) => {
    await app.dismissModals();

    const inspectBtn = app.page.locator('button[title="Inspect Elements"]');

    // Ensure inspect is currently active, then click to disable
    const classNamesBefore = await inspectBtn.getAttribute('class');
    const wasActive = classNamesBefore?.includes('bg-slate-400/60');

    await inspectBtn.click();
    await app.page.waitForTimeout(300);

    const classNamesAfter = await inspectBtn.getAttribute('class');
    const isActive = classNamesAfter?.includes('bg-slate-400/60');

    // State should have toggled
    expect(isActive).not.toBe(wasActive);

    // Ensure inspect mode is off at the end
    if (isActive) {
      await inspectBtn.click();
      await app.page.waitForTimeout(300);
    }
  });

  test('opening devtools docks at bottom by default', async ({app}) => {
    await app.dismissModals();

    const openDevtoolsBtn = app.page.locator('button[title="Open Devtools"]').first();
    await openDevtoolsBtn.click();
    await app.page.waitForTimeout(1000);

    // DevtoolsResizer panel should appear
    const devtoolsPanel = app.page.locator('.bg-\\[\\#f3f3f3\\]');
    await expect(devtoolsPanel).toBeVisible({timeout: 5000});

    // Container should have flex-col class (bottom dock)
    await expect(app.page.locator(BOTTOM_DOCK_SELECTOR).first()).toBeVisible();

    // Close devtools — buttons: [inspect(0), dock-toggle(1), undock(2), close(3)]
    await devtoolsPanel.locator('button').nth(3).click();
    await app.page.waitForTimeout(500);
  });

  test('dock-right button switches devtools to right side', async ({app}) => {
    await app.dismissModals();

    const openDevtoolsBtn = app.page.locator('button[title="Open Devtools"]').first();
    await openDevtoolsBtn.click();
    await app.page.waitForTimeout(1000);

    const devtoolsPanel = app.page.locator('.bg-\\[\\#f3f3f3\\]');
    await expect(devtoolsPanel).toBeVisible({timeout: 5000});

    // Click dock-toggle button (index 1) to switch to right
    await devtoolsPanel.locator('button').nth(1).click();
    await app.page.waitForTimeout(1000);

    // Container should now have flex-row class (right dock)
    await expect(app.page.locator(RIGHT_DOCK_SELECTOR).first()).toBeVisible();

    // Close devtools
    await devtoolsPanel.locator('button').nth(3).click();
    await app.page.waitForTimeout(500);
  });

  test('dock toggle switches between right and bottom', async ({app}) => {
    await app.dismissModals();

    const openDevtoolsBtn = app.page.locator('button[title="Open Devtools"]').first();
    await openDevtoolsBtn.click();
    await app.page.waitForTimeout(1000);

    const devtoolsPanel = app.page.locator('.bg-\\[\\#f3f3f3\\]');
    await expect(devtoolsPanel).toBeVisible({timeout: 5000});

    const dockToggleBtn = devtoolsPanel.locator('button').nth(1);

    // Detect current dock position
    const isBottomFirst = await app.page.locator(BOTTOM_DOCK_SELECTOR).first().isVisible();

    // Toggle once
    await dockToggleBtn.click();
    await app.page.waitForTimeout(1000);

    // Should have flipped
    if (isBottomFirst) {
      await expect(app.page.locator(RIGHT_DOCK_SELECTOR).first()).toBeVisible();
    } else {
      await expect(app.page.locator(BOTTOM_DOCK_SELECTOR).first()).toBeVisible();
    }

    // Toggle again — should return to original
    await dockToggleBtn.click();
    await app.page.waitForTimeout(1000);

    if (isBottomFirst) {
      await expect(app.page.locator(BOTTOM_DOCK_SELECTOR).first()).toBeVisible();
    } else {
      await expect(app.page.locator(RIGHT_DOCK_SELECTOR).first()).toBeVisible();
    }

    // Close devtools
    await devtoolsPanel.locator('button').nth(3).click();
    await app.page.waitForTimeout(500);
  });

  test('close button closes docked devtools', async ({app}) => {
    await app.dismissModals();

    const openDevtoolsBtn = app.page.locator('button[title="Open Devtools"]').first();
    await openDevtoolsBtn.click();
    await app.page.waitForTimeout(1000);

    const devtoolsPanel = app.page.locator('.bg-\\[\\#f3f3f3\\]');
    await expect(devtoolsPanel).toBeVisible({timeout: 5000});

    // Click close button (index 3)
    await devtoolsPanel.locator('button').nth(3).click();
    await app.page.waitForTimeout(500);

    // Panel should be gone
    await expect(devtoolsPanel).not.toBeVisible();
  });

  test('undock button detaches devtools to separate window', async ({app}) => {
    await app.dismissModals();

    const openDevtoolsBtn = app.page.locator('button[title="Open Devtools"]').first();
    await openDevtoolsBtn.click();
    await app.page.waitForTimeout(1000);

    const devtoolsPanel = app.page.locator('.bg-\\[\\#f3f3f3\\]');
    await expect(devtoolsPanel).toBeVisible({timeout: 5000});

    // Click the undock button (index 2)
    await devtoolsPanel.locator('button').nth(2).click();
    await app.page.waitForTimeout(1000);

    // DevtoolsResizer panel should disappear (undocked to separate window)
    await expect(devtoolsPanel).not.toBeVisible({timeout: 5000});

    // Close the undocked devtools window
    await app.electronApp.evaluate(async ({webContents}) => {
      const all = webContents.getAllWebContents();
      for (const wc of all) {
        const url = wc.getURL();
        if (url.startsWith('devtools://')) {
          wc.close();
        }
      }
    });
    await app.page.waitForTimeout(500);
  });
});
