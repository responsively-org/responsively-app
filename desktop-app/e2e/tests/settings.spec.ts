import {test, expect} from '../fixtures/electron-app';

test.describe('Settings', () => {
  test('settings modal opens from menu flyout', async ({app}) => {
    await app.dismissModals();

    await app.openSettings();

    // Settings modal should be open — verify the screenshot location input
    const screenshotInput = app.page.locator('[data-testid="settings-screenshot_location-input"]');
    await expect(screenshotInput).toBeVisible({timeout: 5_000});
  });

  test('screenshot location input is visible and editable', async ({app}) => {
    // Settings modal should still be open
    const screenshotInput = app.page.locator('[data-testid="settings-screenshot_location-input"]');

    if (!(await screenshotInput.isVisible())) {
      await app.openSettings();
    }

    await expect(screenshotInput).toBeVisible();

    // Verify it has a value
    const value = await screenshotInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('accept-language header input is visible and editable', async ({app}) => {
    const acceptLanguageInput = app.page.locator('[data-testid="settings-accept_language-input"]');

    if (!(await acceptLanguageInput.isVisible())) {
      await app.openSettings();
    }

    await expect(acceptLanguageInput).toBeVisible();

    // Type a value
    await acceptLanguageInput.fill('en-US');
    await expect(acceptLanguageInput).toHaveValue('en-US');
  });

  test('save button persists settings', async ({app}) => {
    const screenshotInput = app.page.locator('[data-testid="settings-screenshot_location-input"]');

    if (!(await screenshotInput.isVisible())) {
      await app.openSettings();
    }

    // Click Save using data-testid
    const saveBtn = app.page.locator('[data-testid="settings-save-button"]');
    await saveBtn.click();
    await app.page.waitForTimeout(500);

    // The modal should close after save
    await expect(screenshotInput).not.toBeVisible({timeout: 5_000});
  });

  test('empty screenshot location shows validation error', async ({app}) => {
    await app.dismissModals();

    await app.openSettings();

    const screenshotInput = app.page.locator('[data-testid="settings-screenshot_location-input"]');
    const originalValue = await screenshotInput.inputValue();

    // Clear the input
    await screenshotInput.fill('');

    // Override window.alert to capture the message instead of showing a native dialog
    const alertMessage = await app.page.evaluate(() => {
      return new Promise<string>((resolve) => {
        const origAlert = window.alert;
        window.alert = (msg: string) => {
          window.alert = origAlert;
          resolve(msg);
        };
        const saveBtn = document.querySelector(
          '[data-testid="settings-save-button"]'
        ) as HTMLButtonElement;
        saveBtn?.click();
      });
    });

    expect(alertMessage).toContain('valid location');

    // Restore original value and save
    await screenshotInput.fill(originalValue);
    const saveBtn = app.page.locator('[data-testid="settings-save-button"]');
    await saveBtn.click();
    await app.page.waitForTimeout(500);
  });

  test('screenshot location persists to electron store', async ({app}) => {
    await app.dismissModals();
    await app.openSettings();

    const screenshotInput = app.page.locator('[data-testid="settings-screenshot_location-input"]');
    await expect(screenshotInput).toBeVisible({timeout: 5_000});

    const customPath = '/tmp/e2e-screenshot-persist-test';
    await screenshotInput.fill(customPath);

    const saveBtn = app.page.locator('[data-testid="settings-save-button"]');
    await saveBtn.click();
    await app.page.waitForTimeout(500);

    // Verify the value persisted to the electron store
    const storedValue = await app.page.evaluate(() => {
      return (window as any).electron.store.get('userPreferences.screenshot.saveLocation');
    });
    expect(storedValue).toBe(customPath);
  });

  test('accept-language persists to electron store', async ({app}) => {
    await app.dismissModals();
    await app.openSettings();

    const acceptLanguageInput = app.page.locator('[data-testid="settings-accept_language-input"]');
    await expect(acceptLanguageInput).toBeVisible({timeout: 5_000});

    await acceptLanguageInput.fill('fr-FR,en-US');

    const saveBtn = app.page.locator('[data-testid="settings-save-button"]');
    await saveBtn.click();
    await app.page.waitForTimeout(500);

    // Verify the value persisted to the electron store
    const storedValue = await app.page.evaluate(() => {
      return (window as any).electron.store.get('userPreferences.webRequestHeaderAcceptLanguage');
    });
    expect(storedValue).toBe('fr-FR,en-US');
  });

  test('settings modal can be closed', async ({app}) => {
    await app.dismissModals();

    await app.openSettings();

    const screenshotInput = app.page.locator('[data-testid="settings-screenshot_location-input"]');
    await expect(screenshotInput).toBeVisible({timeout: 5_000});

    // Close with Escape
    await app.page.keyboard.press('Escape');
    await app.page.waitForTimeout(500);

    await expect(screenshotInput).not.toBeVisible({timeout: 5_000});
  });
});
