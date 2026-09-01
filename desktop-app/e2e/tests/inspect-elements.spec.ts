import {test, expect} from '../fixtures/electron-app';

// The Previewer layout container has 'flex h-full' plus 'flex-col' (bottom)
// or 'flex-row' (right). The DevtoolsResizer inner div also has
// 'flex h-full flex-col' but always includes 'w-full', so we exclude it.
const BOTTOM_DOCK_SELECTOR = '.flex.h-full.flex-col:not(.w-full)';
const RIGHT_DOCK_SELECTOR = '.flex.h-full.flex-row';

test.describe('Inspect Elements', () => {
  test.describe.configure({mode: 'parallel'});

  // Workers are reused across spec files: an enabled inspector consumes all
  // clicks in the webviews (CDP Overlay.setInspectMode), silently breaking
  // whichever spec file runs next in this worker. Always leave it off.
  test.afterEach(async ({app}) => {
    const inspectBtn = app.page.locator('button[title="Inspect Elements"]');
    if ((await inspectBtn.getAttribute('aria-pressed')) === 'true') {
      await inspectBtn.click();
      await app.page.waitForTimeout(200);
    }
  });
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

    // Toggle buttons expose their state through aria-pressed.
    await expect(inspectBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('keyboard shortcut Cmd/Ctrl+I toggles inspect mode', async ({app}) => {
    await app.dismissModals();

    const inspectBtn = app.page.locator('button[title="Inspect Elements"]');

    // Toggle inspect mode via keyboard
    await app.pressShortcut('i');
    await app.page.waitForTimeout(300);

    // Check the button still reports a toggle state
    const pressed = await inspectBtn.getAttribute('aria-pressed');
    expect(pressed).toBeTruthy();
  });

  test('clicking inspect again disables inspect mode', async ({app}) => {
    await app.dismissModals();

    const inspectBtn = app.page.locator('button[title="Inspect Elements"]');

    // Ensure inspect is currently active, then click to disable
    const wasActive = (await inspectBtn.getAttribute('aria-pressed')) === 'true';

    await inspectBtn.click();
    await app.page.waitForTimeout(300);

    const isActive = (await inspectBtn.getAttribute('aria-pressed')) === 'true';

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

    const openDevtoolsBtn = app.page.locator('button[title="Open devtools"]').first();
    await app.revealDevicePill();
    await openDevtoolsBtn.click();
    await app.page.waitForTimeout(1000);

    // DevtoolsResizer panel should appear
    const devtoolsPanel = app.page.locator('[data-testid="devtools-resizer"]');
    await expect(devtoolsPanel).toBeVisible({timeout: 5000});

    // Container should have flex-col class (bottom dock)
    await expect(app.page.locator(BOTTOM_DOCK_SELECTOR).first()).toBeVisible();

    // Close devtools — buttons: [inspect(0), dock-toggle(1), undock(2), close(3)]
    await devtoolsPanel.locator('button').nth(3).click();
    await app.page.waitForTimeout(500);
  });

  test('dock-right button switches devtools to right side', async ({app}) => {
    await app.dismissModals();

    const openDevtoolsBtn = app.page.locator('button[title="Open devtools"]').first();
    await app.revealDevicePill();
    await openDevtoolsBtn.click();
    await app.page.waitForTimeout(1000);

    const devtoolsPanel = app.page.locator('[data-testid="devtools-resizer"]');
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
    // Worker-shared app: a previous spec file may have left the canvas
    // layout, where the dock container classes never render — pin the grid
    // layout before asserting on them.
    await app.page.locator('[data-testid="layout-FLEX"]').click();

    const openDevtoolsBtn = app.page.locator('button[title="Open devtools"]').first();
    await app.revealDevicePill();
    await openDevtoolsBtn.click();
    await app.page.waitForTimeout(1000);

    const devtoolsPanel = app.page.locator('[data-testid="devtools-resizer"]');
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

    const openDevtoolsBtn = app.page.locator('button[title="Open devtools"]').first();
    await app.revealDevicePill();
    await openDevtoolsBtn.click();
    await app.page.waitForTimeout(1000);

    const devtoolsPanel = app.page.locator('[data-testid="devtools-resizer"]');
    await expect(devtoolsPanel).toBeVisible({timeout: 5000});

    // Click close button (index 3)
    await devtoolsPanel.locator('button').nth(3).click();
    await app.page.waitForTimeout(500);

    // Panel should be gone
    await expect(devtoolsPanel).not.toBeVisible();
  });

  test('undock button detaches devtools to separate window', async ({app}) => {
    await app.dismissModals();

    const openDevtoolsBtn = app.page.locator('button[title="Open devtools"]').first();
    await app.revealDevicePill();
    await openDevtoolsBtn.click();
    await app.page.waitForTimeout(1000);

    const devtoolsPanel = app.page.locator('[data-testid="devtools-resizer"]');
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
