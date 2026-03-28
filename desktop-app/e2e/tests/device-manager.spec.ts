import {test, expect} from '../fixtures/electron-app';

test.describe('Device Manager', () => {
  test('clicking + button opens device manager view', async ({mainWindow}) => {
    const addDeviceBtn = mainWindow.locator('button[title="Device Manager"]');
    await addDeviceBtn.click();

    await expect(mainWindow.getByText('DEFAULT DEVICES')).toBeVisible({
      timeout: 10_000,
    });
    await expect(mainWindow.getByText('CUSTOM DEVICES', {exact: true})).toBeVisible();
  });

  test('search input filters device list', async ({mainWindow}) => {
    // Device Manager may already be open from the previous test (shared worker window)
    const dmHeader = mainWindow.getByText('DEFAULT DEVICES');
    if (!(await dmHeader.isVisible())) {
      const addDeviceBtn = mainWindow.locator('button[title="Device Manager"]');
      await addDeviceBtn.click();
      await expect(dmHeader).toBeVisible({timeout: 10_000});
    }

    // Type in the search input
    const searchInput = mainWindow.locator('input[placeholder="Search ..."]');
    await searchInput.fill('iPhone');

    // Verify filtered results contain iPhone devices
    const deviceLabels = mainWindow.locator('text=iPhone');
    await expect(deviceLabels.first()).toBeVisible({timeout: 5_000});
  });

  test('close button returns to browser view', async ({mainWindow}) => {
    // Device Manager may already be open from previous tests (shared worker window)
    const dmHeader = mainWindow.getByText('DEFAULT DEVICES');
    if (!(await dmHeader.isVisible())) {
      const addDeviceBtn = mainWindow.locator('button[title="Device Manager"]');
      await addDeviceBtn.click();
      await expect(dmHeader).toBeVisible({timeout: 10_000});
    }

    // Click close button
    const closeBtn = mainWindow.locator('button[title="Close"]');
    await closeBtn.click();

    // Verify we're back to the browser view
    await expect(mainWindow.locator('[data-testid="address-bar"]')).toBeVisible({timeout: 10_000});

    // Device Manager sections should no longer be visible
    await expect(mainWindow.getByText('DEFAULT DEVICES')).not.toBeVisible();
  });
});
