import {ElectronApplication} from '@playwright/test';
import {test, expect} from '../fixtures/electron-app';

/**
 * Helper: get all webview webContents IDs (type === 'webview').
 * Returns them as a stable-ordered array so we can reference
 * "source" vs "other" devices consistently within a test.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getWebviewIds = async (electronApp: ElectronApplication): Promise<number[]> => {
  return electronApp.evaluate(({webContents}) => {
    return (
      webContents
        .getAllWebContents()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview')
        .map((wc: Electron.WebContents) => wc.id)
    );
  });
};

/**
 * Helper: execute JS in a specific webview identified by webContents id.
 */
const execInWebview = async (
  electronApp: ElectronApplication,
  wcId: number,
  js: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  return electronApp.evaluate(
    async ({webContents}, {id, script}: {id: number; script: string}) => {
      const wc = webContents.fromId(id);
      if (!wc) throw new Error(`No webContents with id ${id}`);
      return wc.executeJavaScript(script);
    },
    {id: wcId, script: js}
  );
};

/**
 * Helper: wait for BrowserSync to be loaded on all webviews (poll up to timeoutMs).
 */
const waitForBrowserSync = async (
  electronApp: ElectronApplication,
  ids: number[],
  timeoutMs = 10_000
) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const results: boolean[] = [];
    for (const id of ids) {
      try {
        const ok = await execInWebview(electronApp, id, '!!window.___browserSync___');
        results.push(ok);
      } catch {
        results.push(false);
      }
    }
    if (results.every(Boolean)) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('BrowserSync did not initialise on all webviews within timeout');
};

test.describe('Cross-Device Event Mirroring', () => {
  test.describe.configure({mode: 'parallel'});
  /**
   * Shared setup: navigate to the test page and wait for BrowserSync
   * on all webviews before each test in this group.
   */
  let webviewIds: number[] = [];

  test.beforeEach(async ({app, testServerUrl}) => {
    await app.dismissModals();
    await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 5000});

    webviewIds = await getWebviewIds(app.electronApp);
    // Need at least 2 webviews for cross-device tests
    expect(webviewIds.length).toBeGreaterThanOrEqual(2);

    await waitForBrowserSync(app.electronApp, webviewIds);

    // Reset state: scroll to top + clear click count + clear input on all
    for (const id of webviewIds) {
      await execInWebview(
        app.electronApp,
        id,
        `window.scrollTo(0, 0);
         window.testClickCount = 0;
         document.getElementById('click-count').textContent = 'Clicks: 0';
         document.getElementById('mirror-input').value = '';
         document.getElementById('mirror-checkbox').checked = false;
         true`
      );
    }
    await app.page.waitForTimeout(500);
  });

  // ── Scroll mirroring ──────────────────────────────────────────────

  test('scrolling one device mirrors scroll position to other devices', async ({app}) => {
    const [source, ...others] = webviewIds;

    // Scroll the source device down
    await execInWebview(app.electronApp, source, 'window.scrollTo(0, 400); true');
    // Give BrowserSync time to propagate the scroll event
    await app.page.waitForTimeout(3000);

    // Other devices should have scrolled too (not necessarily exact pixels
    // because BrowserSync may use proportional scrolling, but scrollY > 0)
    for (const id of others) {
      const scrollY: number = await execInWebview(
        app.electronApp,
        id,
        'Math.round(window.scrollY)'
      );
      expect(scrollY).toBeGreaterThan(0);
    }
  });

  // ── Click mirroring ───────────────────────────────────────────────

  test('clicking a button on one device mirrors the click to other devices', async ({app}) => {
    const [source, ...others] = webviewIds;

    // Click the button on the source device
    await execInWebview(
      app.electronApp,
      source,
      `document.getElementById('click-btn').click(); true`
    );
    await app.page.waitForTimeout(3000);

    // The source device should have count = 1
    const sourceCount: number = await execInWebview(
      app.electronApp,
      source,
      'window.testClickCount'
    );
    expect(sourceCount).toBe(1);

    // Other devices should also have received the mirrored click
    for (const id of others) {
      const count: number = await execInWebview(app.electronApp, id, 'window.testClickCount');
      expect(count).toBe(1);
    }
  });

  // ── Form input mirroring ──────────────────────────────────────────

  test('typing in an input on one device mirrors text to other devices', async ({app}) => {
    const [source, ...others] = webviewIds;

    // BrowserSync ghost mode listens for 'keyup' events to sync text inputs.
    // Set value and dispatch keyup for each character to simulate real typing.
    await execInWebview(
      app.electronApp,
      source,
      `(function() {
        var el = document.getElementById('mirror-input');
        el.focus();
        var text = 'hello';
        for (var i = 0; i < text.length; i++) {
          el.value = text.substring(0, i + 1);
          el.dispatchEvent(new KeyboardEvent('keyup', { key: text[i], bubbles: true }));
        }
        return true;
      })()`
    );
    await app.page.waitForTimeout(3000);

    // Other devices should show the same value
    for (const id of others) {
      const value: string = await execInWebview(
        app.electronApp,
        id,
        `document.getElementById('mirror-input').value`
      );
      expect(value).toBe('hello');
    }
  });

  // ── Checkbox toggle mirroring ─────────────────────────────────────

  test('toggling a checkbox on one device mirrors to other devices', async ({app}) => {
    const [source, ...others] = webviewIds;

    // Check the checkbox on the source device
    await execInWebview(
      app.electronApp,
      source,
      `(function() {
        var cb = document.getElementById('mirror-checkbox');
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
        cb.dispatchEvent(new Event('click', { bubbles: true }));
        return true;
      })()`
    );
    await app.page.waitForTimeout(3000);

    // Other devices should have the checkbox checked
    for (const id of others) {
      const checked: boolean = await execInWebview(
        app.electronApp,
        id,
        `document.getElementById('mirror-checkbox').checked`
      );
      expect(checked).toBe(true);
    }
  });

  // ── Disabled mirroring: scroll not received ───────────────────────

  test('device with mirroring disabled does not receive scroll events', async ({app}) => {
    const [isolated, source, ...rest] = webviewIds;

    // Disconnect BrowserSync on the isolated device
    await execInWebview(
      app.electronApp,
      isolated,
      `if (window.___browserSync___) { window.___browserSync___.socket.close(); } true`
    );
    await app.page.waitForTimeout(1000);

    // Scroll the source device
    await execInWebview(app.electronApp, source, 'window.scrollTo(0, 400); true');
    await app.page.waitForTimeout(3000);

    // The isolated device should NOT have scrolled
    const isolatedScroll: number = await execInWebview(
      app.electronApp,
      isolated,
      'Math.round(window.scrollY)'
    );
    expect(isolatedScroll).toBe(0);

    // But other connected devices should have scrolled
    for (const id of rest) {
      const scrollY: number = await execInWebview(
        app.electronApp,
        id,
        'Math.round(window.scrollY)'
      );
      expect(scrollY).toBeGreaterThan(0);
    }

    // Reconnect for cleanup
    await execInWebview(
      app.electronApp,
      isolated,
      `if (window.___browserSync___) { window.___browserSync___.socket.open(); } true`
    );
    await app.page.waitForTimeout(3000);
  });

  // ── Disabled mirroring: clicks not received ───────────────────────

  test('device with mirroring disabled does not receive click events', async ({app}) => {
    const [isolated, source] = webviewIds;

    // Disconnect BrowserSync on the isolated device
    await execInWebview(
      app.electronApp,
      isolated,
      `if (window.___browserSync___) { window.___browserSync___.socket.close(); } true`
    );
    await app.page.waitForTimeout(1000);

    // Click the button on the source device
    await execInWebview(
      app.electronApp,
      source,
      `document.getElementById('click-btn').click(); true`
    );
    await app.page.waitForTimeout(3000);

    // Source should have count = 1
    const sourceCount: number = await execInWebview(
      app.electronApp,
      source,
      'window.testClickCount'
    );
    expect(sourceCount).toBe(1);

    // Isolated device should still have count = 0
    const isolatedCount: number = await execInWebview(
      app.electronApp,
      isolated,
      'window.testClickCount'
    );
    expect(isolatedCount).toBe(0);

    // Reconnect for cleanup
    await execInWebview(
      app.electronApp,
      isolated,
      `if (window.___browserSync___) { window.___browserSync___.socket.open(); } true`
    );
    await app.page.waitForTimeout(3000);
  });
});
