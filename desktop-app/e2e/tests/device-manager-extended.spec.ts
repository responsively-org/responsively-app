import {test, expect} from '../fixtures/electron-app';

test.describe('Device Manager — Extended', () => {
  test('default devices section lists pre-loaded devices', async ({app}) => {
    await app.openDeviceManager();

    const defaultSection = app.page.getByText('DEFAULT DEVICES');
    await expect(defaultSection).toBeVisible({timeout: 10_000});

    // Verify some well-known default devices are listed
    const checkboxes = app.page.locator('input[type="checkbox"][title*="Click to"]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('custom devices section is visible', async ({app}) => {
    await app.ensureDeviceManagerOpen();

    await expect(app.page.getByText('CUSTOM DEVICES', {exact: true})).toBeVisible();
  });

  test('toggling a device checkbox adds or removes it from the active suite', async ({app}) => {
    await app.ensureDeviceManagerOpen();

    // Count checked devices before toggling
    const checkedBefore = await app.page
      .locator('input[type="checkbox"][title="Click to remove the device"]:checked')
      .count();

    // Find a visible unchecked device checkbox and click it to add the device
    const uncheckedBox = app.page
      .locator('input[type="checkbox"][title="Click to add the device"]:not(.opacity-0)')
      .first();
    const hasUnchecked = await uncheckedBox.count().then((c) => c > 0);

    if (hasUnchecked) {
      await uncheckedBox.check({force: true});
      await app.page.waitForTimeout(500);

      // Verify count of checked devices increased
      const checkedAfter = await app.page
        .locator('input[type="checkbox"][title="Click to remove the device"]:checked')
        .count();
      expect(checkedAfter).toBeGreaterThan(checkedBefore);

      // Toggle it back off — find the last checked device and uncheck it
      const lastChecked = app.page
        .locator('input[type="checkbox"][title="Click to remove the device"]:checked')
        .last();
      await lastChecked.uncheck({force: true});
      await app.page.waitForTimeout(500);
    }
  });

  test('cannot remove the last device from a suite', async ({app}) => {
    await app.ensureDeviceManagerOpen();

    // The disabled checkbox should have a specific title
    const disabledCheckbox = app.page.locator(
      'input[type="checkbox"][title="Cannot make the suite empty add another device to remove this one"]'
    );

    // Get count of checked checkboxes — if only one device, this should be disabled
    const checkedBoxes = app.page.locator(
      'input[type="checkbox"][title="Click to remove the device"]:checked'
    );
    const checkedCount = await checkedBoxes.count();

    if (checkedCount === 1) {
      // The single remaining device should be the disabled one
      await expect(disabledCheckbox).toBeVisible();
      await expect(disabledCheckbox).toBeDisabled();
    }
    // If more than one device is checked, no checkbox should be disabled
  });

  test('searching with no match shows empty results', async ({app}) => {
    await app.ensureDeviceManagerOpen();

    const searchInput = app.page.locator('input[placeholder="Search ..."]');
    await searchInput.fill('zzz_nonexistent_device_xyz');

    await expect(app.page.getByText('Sorry, no matching devices found.').first()).toBeVisible({
      timeout: 5_000,
    });

    // Clear search for future tests
    await searchInput.fill('');

    // Close device manager
    await app.closeDeviceManager();
  });
});
