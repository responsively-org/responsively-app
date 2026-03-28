import {test as baseTest, expect} from '../fixtures/electron-app';
import https from 'https';
import {execSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Extend the base test to provide a self-signed HTTPS server
// eslint-disable-next-line @typescript-eslint/ban-types
const test = baseTest.extend<{}, {selfSignedUrl: string}>({
  selfSignedUrl: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const certDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-ssl-certs-'));
      const keyPath = path.join(certDir, 'key.pem');
      const certPath = path.join(certDir, 'cert.pem');

      execSync(
        `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 1 -nodes -subj "/CN=localhost"`,
        {stdio: 'pipe'}
      );

      const key = fs.readFileSync(keyPath);
      const cert = fs.readFileSync(certPath);

      const server = https.createServer({key, cert}, (_req, res) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<html><body><h1 id="ssl-content">Secure Page Loaded</h1></body></html>');
      });

      await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', () => resolve());
      });

      const addr = server.address() as {port: number};
      const url = `https://127.0.0.1:${addr.port}`;

      await use(url);

      server.close();
      try {
        fs.rmSync(certDir, {recursive: true, force: true});
      } catch {
        // Ignore cleanup errors
      }
    },
    {scope: 'worker'},
  ],
});

async function getWebviewText(app: any): Promise<string> {
  return app.electronApp.evaluate(async ({webContents}: any) => {
    const wv = webContents.getAllWebContents().find((wc: any) => wc.getType() === 'webview');
    if (!wv) return '';
    try {
      return await wv.executeJavaScript('document.body ? document.body.innerText : ""');
    } catch {
      return '';
    }
  });
}

test.describe('Allow Insecure SSL', () => {
  // Test order matters: enable SSL first so Chromium doesn't cache the rejection

  test('enabling Allow Insecure SSL loads self-signed cert page', async ({app, selfSignedUrl}) => {
    await app.dismissModals();

    // Enable Allow Insecure SSL via store BEFORE navigating
    await app.page.evaluate(() => {
      (window as any).electron.store.set('userPreferences.allowInsecureSSLConnections', true);
    });

    await app.page.waitForTimeout(500);

    // Navigate to the self-signed URL
    await app.navigateTo(selfSignedUrl, {timeout: 5000});

    // The page should load successfully
    await expect
      .poll(async () => getWebviewText(app), {timeout: 15_000})
      .toContain('Secure Page Loaded');
  });

  test('disabling Allow Insecure SSL prevents loading', async ({
    app,
    selfSignedUrl,
    testServerUrl,
  }) => {
    await app.dismissModals();

    // Navigate away first to clear any loaded content
    await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 3000});

    // Disable Allow Insecure SSL
    await app.page.evaluate(() => {
      (window as any).electron.store.set('userPreferences.allowInsecureSSLConnections', false);
    });

    // Flush Chromium's cached TLS sessions so the certificate-error event
    // fires again on the next navigation to the self-signed URL.
    await app.electronApp.evaluate(async ({session}) => {
      await session.defaultSession.clearAuthCache();
      await session.defaultSession.clearStorageData({
        storages: ['cachestorage'],
      });
      // Flush socket pools to drop kept-alive TLS connections
      await (session.defaultSession as any).closeAllConnections();
    });
    await app.page.waitForTimeout(500);

    // Navigate to the self-signed URL
    await app.navigateTo(selfSignedUrl, {timeout: 5000});

    // The page should NOT load (cert rejected)
    const content = await getWebviewText(app);
    expect(content).not.toContain('Secure Page Loaded');
  });

  test('Allow Insecure SSL toggle in menu updates the store', async ({app}) => {
    await app.dismissModals();

    // Ensure it's off first
    await app.page.evaluate(() => {
      (window as any).electron.store.set('userPreferences.allowInsecureSSLConnections', false);
    });

    // Open menu and click the toggle
    await app.openMenuFlyout();
    const sslRow = app.page.locator('div.flex.flex-row').filter({hasText: 'Allow Insecure SSL'});
    const toggleLabel = sslRow.locator('label');
    await toggleLabel.click();
    await app.page.waitForTimeout(500);

    // Verify the store value changed
    const storeValue = await app.page.evaluate(() => {
      return (window as any).electron.store.get('userPreferences.allowInsecureSSLConnections');
    });
    expect(storeValue).toBe(true);

    // Click again to toggle off
    await toggleLabel.click();
    await app.page.waitForTimeout(500);

    const storeValueAfter = await app.page.evaluate(() => {
      return (window as any).electron.store.get('userPreferences.allowInsecureSSLConnections');
    });
    expect(storeValueAfter).toBe(false);

    await app.closeMenuFlyout();
  });
});
