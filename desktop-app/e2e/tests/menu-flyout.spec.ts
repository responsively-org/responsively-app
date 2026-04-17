import {ElectronApplication} from '@playwright/test';
import {test, expect} from '../fixtures/electron-app';

const WEBVIEW_EXECUTION_FAILED = '__WEBVIEW_EXECUTION_FAILED__';

const getWebviewIds = async (electronApp: ElectronApplication): Promise<number[]> => {
  return electronApp.evaluate(({webContents}) => {
    return webContents
      .getAllWebContents()
      .filter((wc: Electron.WebContents & {getType?: () => string}) => wc.getType?.() === 'webview')
      .map((wc: Electron.WebContents) => wc.id);
  });
};

const execInWebview = async (
  electronApp: ElectronApplication,
  wcId: number,
  script: string
): Promise<unknown> => {
  return electronApp.evaluate(
    async ({webContents}, {id, js}: {id: number; js: string}) => {
      const wc = webContents.fromId(id);
      if (!wc) {
        return WEBVIEW_EXECUTION_FAILED;
      }
      try {
        return await wc.executeJavaScript(js);
      } catch (_error) {
        return WEBVIEW_EXECUTION_FAILED;
      }
    },
    {id: wcId, js: script}
  );
};

test.describe('Menu Flyout', () => {
  test('clicking the overflow menu button opens the flyout', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    // Verify flyout content is visible
    await expect(app.page.getByText('Zoom')).toBeVisible();
    await expect(app.page.getByText('UI Theme')).toBeVisible();
  });

  test('clicking outside the flyout closes it', async ({app}) => {
    // Menu should still be open from previous test
    const zoomLabel = app.page.getByText('Zoom');
    if (!(await zoomLabel.isVisible())) {
      await app.openMenuFlyout();
    }

    // Click outside to close — click on the address bar area
    await app.addressBar.click();
    await app.page.waitForTimeout(300);
  });

  test('zoom section displays current zoom percentage', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    await expect(app.page.getByText('Zoom')).toBeVisible();
    const zoomPercent = app.page.locator('span:has-text("%")').first();
    await expect(zoomPercent).toBeVisible();

    await app.closeMenuFlyout();
  });

  test('UI Theme toggle is present and functional', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    await expect(app.page.getByText('UI Theme')).toBeVisible();

    // Theme toggle button should be present
    const themeBtn = app.page.locator('[data-testid="theme-toggle"]');
    await expect(themeBtn).toBeVisible();

    await app.closeMenuFlyout();
  });

  test('dock devtools toggle is present', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    await expect(app.page.getByText('Dock Devtools')).toBeVisible();

    await app.closeMenuFlyout();
  });

  test('allow insecure SSL toggle is present', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    await expect(app.page.getByText('Allow Insecure SSL')).toBeVisible();

    await app.closeMenuFlyout();
  });

  test('clear history button is present and clickable', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    const clearHistoryLabel = app.page.getByText('Clear History');
    await expect(clearHistoryLabel).toBeVisible();

    // Find the button next to the Clear History label (inside its parent container)
    const clearHistoryContainer = clearHistoryLabel.locator('..');
    const trashBtn = clearHistoryContainer.locator('button');
    await expect(trashBtn).toBeVisible();

    await app.closeMenuFlyout();
  });

  test('preview layout options are displayed', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    await expect(app.page.getByText('Preview Layout')).toBeVisible();

    // Layout buttons are inside a ButtonGroup — check for button text content
    const columnBtn = app.page.locator('button:has-text("Column")');
    const flexBtn = app.page.locator('button:has-text("Flex")');
    const masonryBtn = app.page.locator('button:has-text("Masonry")');

    await expect(columnBtn.first()).toBeVisible();
    await expect(flexBtn.first()).toBeVisible();
    await expect(masonryBtn.first()).toBeVisible();

    await app.closeMenuFlyout();
  });

  test('bookmarks section is visible', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    await expect(app.page.getByText('Bookmarks')).toBeVisible();

    await app.closeMenuFlyout();
  });

  test('settings option is visible', async ({app}) => {
    await app.dismissModals();

    await app.openMenuFlyout();

    await expect(app.page.getByText('Settings')).toBeVisible();

    await app.closeMenuFlyout();
  });

  test('javascript all previews toggle disables every preview and blocks screenshot all', async ({
    app,
    testServerUrl,
  }) => {
    await app.dismissModals();
    await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 5000});

    await expect(app.firstWebview).toHaveAttribute('src', /test-page\.html/, {
      timeout: 15_000,
    });

    const initialIds = await getWebviewIds(app.electronApp);
    expect(initialIds.length).toBeGreaterThanOrEqual(1);

    for (const id of initialIds) {
      await expect
        .poll(() => execInWebview(app.electronApp, id, 'typeof window.testClickCount'), {
          timeout: 10_000,
        })
        .toBe('number');
    }

    const screenshotAllBtn = app.page.locator('button[title^="Screenshot All WebViews"]');
    await expect(screenshotAllBtn).toBeEnabled();

    await app.openMenuFlyout();
    const jsRow = app.page.getByText('JavaScript (All Previews)').locator('xpath=..');
    const jsToggle = jsRow.locator('input[type="checkbox"]');

    await expect(jsToggle).toBeChecked();
    await jsToggle.uncheck({force: true});

    await expect(screenshotAllBtn).toBeDisabled();
    await expect(screenshotAllBtn).toHaveAttribute(
      'title',
      'Screenshot All WebViews is unavailable while JavaScript is disabled for one or more previews'
    );

    await expect
      .poll(async () => JSON.stringify(await getWebviewIds(app.electronApp)), {timeout: 10_000})
      .not.toBe(JSON.stringify(initialIds));

    const disabledIds = await getWebviewIds(app.electronApp);
    expect(disabledIds.length).toBe(initialIds.length);

    for (const id of disabledIds) {
      await expect
        .poll(() => execInWebview(app.electronApp, id, 'typeof window.testClickCount'), {
          timeout: 10_000,
        })
        .toBe(WEBVIEW_EXECUTION_FAILED);
    }

    await app.closeMenuFlyout();
    await app.openMenuFlyout();
    const reenabledToggle = app.page
      .getByText('JavaScript (All Previews)')
      .locator('xpath=..')
      .locator('input[type="checkbox"]');

    await reenabledToggle.check({force: true});

    await expect(screenshotAllBtn).toBeEnabled();
    await expect(screenshotAllBtn).toHaveAttribute('title', 'Screenshot All WebViews');

    await expect
      .poll(async () => JSON.stringify(await getWebviewIds(app.electronApp)), {timeout: 10_000})
      .not.toBe(JSON.stringify(disabledIds));

    const reenabledIds = await getWebviewIds(app.electronApp);
    for (const id of reenabledIds) {
      await expect
        .poll(() => execInWebview(app.electronApp, id, 'typeof window.testClickCount'), {
          timeout: 10_000,
        })
        .toBe('number');
    }

    await app.closeMenuFlyout();
  });
});
