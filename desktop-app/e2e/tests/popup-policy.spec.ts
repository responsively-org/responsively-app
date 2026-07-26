import {test, expect} from '../fixtures/electron-app';
import type {ResponsivelyApp} from '../models/app';

// Clicks an element inside a preview webview's guest page. Any guest works:
// window.open routing is wired per-guest in the main process.
const clickInWebview = async (app: ResponsivelyApp, selector: string) => {
  await app.electronApp.evaluate(async ({webContents}, sel) => {
    const webviews = webContents
      .getAllWebContents()
      .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview');
    if (webviews.length === 0) {
      throw new Error('No webview guests found');
    }
    await webviews[0].executeJavaScript(`document.querySelector(${JSON.stringify(sel)}).click()`);
  }, selector);
};

test.describe('Popup Policy', () => {
  test.beforeAll(async ({app, testServerUrl}) => {
    await app.dismissModals();
    await app.navigateTo(`${testServerUrl}/popup-test.html`);
    await expect(app.addressBar).toHaveValue(/popup-test\.html/, {timeout: 15_000});
  });

  test.afterAll(async ({app}) => {
    // Worker-scoped app persists across spec files — leave the default
    // behavior and the real shell.openExternal behind.
    await app.page.evaluate(() => {
      (window as any).electron.store.set('userPreferences.popupBehavior', 'in-preview');
    });
    await app.electronApp.evaluate(({shell}) => {
      const g = global as any;
      if (g.__origOpenExternal) {
        shell.openExternal = g.__origOpenExternal;
        delete g.__origOpenExternal;
        delete g.__openExternalCalls;
      }
    });
  });

  test('target=_blank link navigates the previews by default', async ({app, testServerUrl}) => {
    await clickInWebview(app, '#blank-link');
    await expect(app.addressBar).toHaveValue(/test-page-2\.html/, {timeout: 15_000});

    await app.navigateTo(`${testServerUrl}/popup-test.html`);
    await expect(app.addressBar).toHaveValue(/popup-test\.html/, {timeout: 15_000});
  });

  test('window.open navigates the previews by default', async ({app, testServerUrl}) => {
    await clickInWebview(app, '#js-popup');
    await expect(app.addressBar).toHaveValue(/test-page-2\.html/, {timeout: 15_000});

    await app.navigateTo(`${testServerUrl}/popup-test.html`);
    await expect(app.addressBar).toHaveValue(/popup-test\.html/, {timeout: 15_000});
  });

  test('external setting sends popups to the OS browser instead', async ({app}) => {
    // Stub shell.openExternal in the main process so the test asserts the
    // call without opening a real browser.
    await app.electronApp.evaluate(({shell}) => {
      const g = global as any;
      g.__origOpenExternal = shell.openExternal;
      g.__openExternalCalls = [];
      shell.openExternal = async (url: string) => {
        g.__openExternalCalls.push(url);
      };
    });
    await app.page.evaluate(() => {
      (window as any).electron.store.set('userPreferences.popupBehavior', 'external');
    });

    await clickInWebview(app, '#blank-link');

    // Mirroring replays the click in every preview; the dedup in the main
    // process must still produce exactly ONE external open per user click.
    await expect
      .poll(() => app.electronApp.evaluate(() => (global as any).__openExternalCalls as string[]), {
        timeout: 10_000,
      })
      .toEqual([expect.stringContaining('test-page-2.html')]);
    // The previews stay where they were.
    await expect(app.addressBar).toHaveValue(/popup-test\.html/);
  });
});
