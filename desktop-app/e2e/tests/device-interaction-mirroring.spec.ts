import {test, expect} from '../fixtures/electron-app';

test.describe('Device Interaction Mirroring', () => {
  test.describe.configure({mode: 'parallel'});

  test.describe('Navigation Mirroring', () => {
    test('navigate to test page updates ALL webviews', async ({app, testServerUrl}) => {
      await app.dismissModals();
      await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 5000});

      const webviewUrls: string[] = await app.electronApp.evaluate(({webContents}) => {
        return webContents
          .getAllWebContents()
          .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview')
          .map((wc: Electron.WebContents) => wc.getURL());
      });

      expect(webviewUrls.length).toBeGreaterThanOrEqual(1);
      for (const url of webviewUrls) {
        expect(url).toContain('test-page.html');
      }
    });

    test('back navigation returns to previous page', async ({app, testServerUrl}) => {
      await app.dismissModals();

      // Navigate to page 1 then page 2 to create a history entry
      await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 5000});
      await app.navigateTo(`${testServerUrl}/test-page-2.html`, {timeout: 5000});

      // Verify we're on page 2
      const beforeBack = await app.addressBar.inputValue();
      expect(beforeBack).toContain('test-page-2.html');

      // Call goBack() on all webviews to avoid PubSub accumulation issue.
      // The primary webview's did-navigate handler will update the Redux address.
      await app.electronApp.evaluate(async ({webContents}) => {
        const webviews = webContents
          .getAllWebContents()
          .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview');
        for (const wv of webviews) {
          if (wv.navigationHistory.canGoBack()) {
            wv.goBack();
          }
        }
      });
      await app.page.waitForTimeout(5000);

      // The address bar should no longer show page 2
      const addressValue = await app.addressBar.inputValue();
      expect(addressValue).not.toContain('test-page-2.html');
    });

    test('forward navigation returns to next page', async ({app, testServerUrl}) => {
      await app.dismissModals();

      // Set up clean history: page 1 → page 2 → back → on page 1
      await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 5000});
      await app.navigateTo(`${testServerUrl}/test-page-2.html`, {timeout: 5000});

      // Go back on all webviews
      await app.electronApp.evaluate(async ({webContents}) => {
        const webviews = webContents
          .getAllWebContents()
          .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview');
        for (const wv of webviews) {
          if (wv.navigationHistory.canGoBack()) {
            wv.goBack();
          }
        }
      });
      await app.page.waitForTimeout(5000);

      // Now go forward on all webviews
      await app.electronApp.evaluate(async ({webContents}) => {
        const webviews = webContents
          .getAllWebContents()
          .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview');
        for (const wv of webviews) {
          if (wv.navigationHistory.canGoForward()) {
            wv.goForward();
          }
        }
      });
      await app.page.waitForTimeout(5000);

      // The address bar should reflect page 2 again
      const addressValue = await app.addressBar.inputValue();
      expect(addressValue).toContain('test-page-2.html');
    });

    test('global refresh reloads ALL webviews', async ({app, testServerUrl}) => {
      await app.dismissModals();
      await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 5000});

      // Click global refresh
      await app.refreshButton.click();
      await app.page.waitForTimeout(3000);

      // All webviews should still show the same URL
      const webviewUrls: string[] = await app.electronApp.evaluate(({webContents}) => {
        return webContents
          .getAllWebContents()
          .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview')
          .map((wc: Electron.WebContents) => wc.getURL());
      });
      expect(webviewUrls.length).toBeGreaterThanOrEqual(1);
      for (const url of webviewUrls) {
        expect(url).toContain('test-page.html');
      }
    });
  });

  test.describe('BrowserSync / Event Mirroring', () => {
    test('BrowserSync client is injected into webviews', async ({app, testServerUrl}) => {
      await app.dismissModals();
      await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 5000});

      // Wait for BrowserSync to initialize
      await app.page.waitForTimeout(5000);

      const bsStatus: boolean[] = await app.electronApp.evaluate(async ({webContents}) => {
        const webviews = webContents
          .getAllWebContents()
          .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview');

        const results: boolean[] = [];
        for (const wv of webviews) {
          try {
            const hasBs = await wv.executeJavaScript('!!window.___browserSync___');
            results.push(hasBs);
          } catch {
            results.push(false);
          }
        }
        return results;
      });

      expect(bsStatus.length).toBeGreaterThanOrEqual(1);
      for (const status of bsStatus) {
        expect(status).toBe(true);
      }
    });

    test('event mirroring toggle exists per device', async ({app}) => {
      await app.dismissModals();

      const webviewCount = await app.webviews.count();
      const mirroringBtnCount = await app.eventMirroringButtons.count();

      expect(mirroringBtnCount).toBe(webviewCount);
    });

    test('disabling mirroring closes BrowserSync socket', async ({app, testServerUrl}) => {
      await app.dismissModals();
      await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 5000});
      await app.page.waitForTimeout(5000);

      // Click first "Disable Event Mirroring" button
      const mirroringBtn = app.eventMirroringButtons.first();
      await mirroringBtn.click();
      await app.page.waitForTimeout(2000);

      // Check that at least one webview has a disconnected BrowserSync socket
      const socketStates: boolean[] = await app.electronApp.evaluate(async ({webContents}) => {
        const webviews = webContents
          .getAllWebContents()
          .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview');

        const states: boolean[] = [];
        for (const wv of webviews) {
          try {
            const connected = await wv.executeJavaScript(
              'window.___browserSync___ ? window.___browserSync___.socket.connected : true'
            );
            states.push(connected);
          } catch {
            states.push(true);
          }
        }
        return states;
      });

      // At least one socket should be disconnected
      expect(socketStates).toContain(false);
    });

    test('re-enabling mirroring reconnects BrowserSync socket', async ({app, testServerUrl}) => {
      await app.dismissModals();
      await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 5000});
      await app.page.waitForTimeout(5000);

      // Disable mirroring first
      const mirroringBtn = app.eventMirroringButtons.first();
      await mirroringBtn.click();
      await app.page.waitForTimeout(2000);

      // Re-enable mirroring
      await mirroringBtn.click();
      await app.page.waitForTimeout(8000);

      // All sockets should be connected after re-enabling
      const socketStates: boolean[] = await app.electronApp.evaluate(async ({webContents}) => {
        const webviews = webContents
          .getAllWebContents()
          .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview');

        const states: boolean[] = [];
        for (const wv of webviews) {
          try {
            const connected = await wv.executeJavaScript(
              'window.___browserSync___ ? window.___browserSync___.socket.connected : false'
            );
            states.push(connected);
          } catch {
            states.push(false);
          }
        }
        return states;
      });

      for (const connected of socketStates) {
        expect(connected).toBe(true);
      }
    });
  });

  test.describe('Scroll Mirroring', () => {
    test('scroll to top button resets scroll in webview', async ({app, testServerUrl}) => {
      await app.dismissModals();
      await app.navigateTo(`${testServerUrl}/test-page.html`, {timeout: 5000});
      await app.page.waitForTimeout(2000);

      // Scroll down in the first webview via executeJavaScript
      await app.electronApp.evaluate(async ({webContents}) => {
        const webviews = webContents
          .getAllWebContents()
          .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview');

        if (webviews.length > 0) {
          await webviews[0].executeJavaScript('window.scrollTo(0, 500); true');
        }
      });
      await app.page.waitForTimeout(1000);

      // Click "Scroll to Top" button
      const scrollToTopBtn = app.scrollToTopButtons.first();
      await scrollToTopBtn.click();
      await app.page.waitForTimeout(1500);

      // Verify scrollY is 0
      const scrollY: number = await app.electronApp.evaluate(async ({webContents}) => {
        const webviews = webContents
          .getAllWebContents()
          .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview');

        if (webviews.length === 0) return -1;
        try {
          return await webviews[0].executeJavaScript('window.scrollY');
        } catch {
          return -1;
        }
      });

      expect(scrollY).toBe(0);
    });

    test('per-device refresh button exists for each device', async ({app}) => {
      await app.dismissModals();

      const webviewCount = await app.webviews.count();
      const refreshBtnCount = await app.perDeviceRefreshButtons.count();

      expect(refreshBtnCount).toBe(webviewCount);
    });
  });
});
