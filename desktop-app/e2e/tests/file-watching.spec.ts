import {test, expect} from '../fixtures/electron-app';
import fs from 'fs';
import os from 'os';
import path from 'path';

test.describe('File Watching', () => {
  test('local HTML file renders in webview via file:// URL', async ({app}) => {
    await app.dismissModals();

    // Create a temp HTML file
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-filewatch-'));
    const htmlPath = path.join(tmpDir, 'test-watch.html');
    fs.writeFileSync(
      htmlPath,
      '<html><body><h1 id="watch-content">Original Content</h1></body></html>'
    );

    const fileUrl = `file://${htmlPath}`;
    await app.navigateTo(fileUrl, {timeout: 5000});

    // Verify the content loaded in the webview
    await expect
      .poll(
        async () => {
          return app.electronApp.evaluate(async ({webContents}) => {
            const wv = webContents
              .getAllWebContents()
              .find((wc) => (wc as any).getType() === 'webview');
            if (!wv) return '';
            try {
              return await wv.executeJavaScript(
                'document.getElementById("watch-content") ? document.getElementById("watch-content").innerText : ""'
              );
            } catch {
              return '';
            }
          });
        },
        {timeout: 15_000}
      )
      .toBe('Original Content');

    // Cleanup
    try {
      fs.rmSync(tmpDir, {recursive: true, force: true});
    } catch {
      // Ignore
    }
  });

  test('modifying watched HTML file triggers reload with new content', async ({app}) => {
    await app.dismissModals();

    // Create a temp HTML file
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-filewatch-'));
    const htmlPath = path.join(tmpDir, 'test-watch.html');
    fs.writeFileSync(htmlPath, '<html><body><h1 id="watch-content">Before Edit</h1></body></html>');

    const fileUrl = `file://${htmlPath}`;
    await app.navigateTo(fileUrl, {timeout: 5000});

    // Wait for initial content to load
    await expect
      .poll(
        async () => {
          return app.electronApp.evaluate(async ({webContents}) => {
            const wv = webContents
              .getAllWebContents()
              .find((wc) => (wc as any).getType() === 'webview');
            if (!wv) return '';
            try {
              return await wv.executeJavaScript(
                'document.getElementById("watch-content") ? document.getElementById("watch-content").innerText : ""'
              );
            } catch {
              return '';
            }
          });
        },
        {timeout: 15_000}
      )
      .toBe('Before Edit');

    // Modify the file
    await app.page.waitForTimeout(1000); // Let the watcher settle
    fs.writeFileSync(htmlPath, '<html><body><h1 id="watch-content">After Edit</h1></body></html>');

    // Wait for BrowserSync to detect the change and reload
    await expect
      .poll(
        async () => {
          return app.electronApp.evaluate(async ({webContents}) => {
            const wv = webContents
              .getAllWebContents()
              .find((wc) => (wc as any).getType() === 'webview');
            if (!wv) return '';
            try {
              return await wv.executeJavaScript(
                'document.getElementById("watch-content") ? document.getElementById("watch-content").innerText : ""'
              );
            } catch {
              return '';
            }
          });
        },
        {timeout: 30_000, intervals: [500, 1000, 2000]}
      )
      .toBe('After Edit');

    // Cleanup
    try {
      fs.rmSync(tmpDir, {recursive: true, force: true});
    } catch {
      // Ignore
    }
  });

  test('navigating away from file URL stops the file watcher', async ({app, testServerUrl}) => {
    await app.dismissModals();

    // Create a temp HTML file and navigate to it
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-filewatch-'));
    const htmlPath = path.join(tmpDir, 'test-watch.html');
    fs.writeFileSync(
      htmlPath,
      '<html><body><h1 id="watch-content">File Content</h1></body></html>'
    );

    const fileUrl = `file://${htmlPath}`;
    await app.navigateTo(fileUrl, {timeout: 5000});

    // Wait for initial content
    await expect
      .poll(
        async () => {
          return app.electronApp.evaluate(async ({webContents}) => {
            const wv = webContents
              .getAllWebContents()
              .find((wc) => (wc as any).getType() === 'webview');
            if (!wv) return '';
            try {
              return await wv.executeJavaScript(
                'document.getElementById("watch-content") ? document.getElementById("watch-content").innerText : ""'
              );
            } catch {
              return '';
            }
          });
        },
        {timeout: 15_000}
      )
      .toBe('File Content');

    // Navigate to an HTTP URL — watcher should stop
    await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 3000});

    // Modify the file — it should NOT trigger a reload since we're on HTTP now
    fs.writeFileSync(
      htmlPath,
      '<html><body><h1 id="watch-content">Modified After Nav</h1></body></html>'
    );

    await app.page.waitForTimeout(3000);

    // Verify we're still on the test server page, not the file page
    const currentUrl = await app.addressBar.inputValue();
    expect(currentUrl).toContain(testServerUrl);

    // Cleanup
    try {
      fs.rmSync(tmpDir, {recursive: true, force: true});
    } catch {
      // Ignore
    }
  });
});
