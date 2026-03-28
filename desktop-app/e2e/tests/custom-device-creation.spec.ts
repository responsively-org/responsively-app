import {test, expect} from '../fixtures/electron-app';

test.describe('Custom Device Creation', () => {
  test.describe.configure({mode: 'parallel'});

  test('empty state shows "No custom devices" message and add button', async ({app}) => {
    await app.dismissModals();
    await app.openDeviceManager();

    const customSection = app.page.locator('#accordion-body-CUSTOM\\ DEVICES');
    await expect(customSection.getByText('No custom devices added yet!')).toBeVisible();
    await expect(
      customSection.getByRole('button', {name: 'Add Custom Device'}).first()
    ).toBeVisible();

    await app.closeDeviceManager();
  });

  test('add custom device form opens with correct defaults', async ({app}) => {
    await app.dismissModals();
    await app.openDeviceManager();

    await app.page.getByRole('button', {name: 'Add Custom Device'}).first().click();
    await app.page.waitForTimeout(500);

    // Modal title
    await expect(app.page.getByText('Add Custom Device').first()).toBeVisible();

    // Default values
    const nameInput = app.page.getByLabel('Device Name');
    await expect(nameInput).toHaveValue('');

    const widthInput = app.page.getByLabel('Device Width');
    await expect(widthInput).toHaveValue('400');

    const heightInput = app.page.getByLabel('Device Height');
    await expect(heightInput).toHaveValue('600');

    const dprInput = app.page.getByLabel('Device DPR');
    await expect(dprInput).toHaveValue('1');

    // Default type is phone
    const typeSelect = app.page.locator('#device-capabilities');
    await expect(typeSelect).toHaveValue('phone');

    // Touch and mobile default checked for phone
    const touchCheckbox = app.page.getByLabel('Touch Capable');
    await expect(touchCheckbox).toBeChecked();

    const mobileCheckbox = app.page.getByLabel('Mobile Capable (Rotatable)');
    await expect(mobileCheckbox).toBeChecked();

    // Buttons: Cancel and Add
    await expect(app.page.getByRole('button', {name: 'Cancel'})).toBeVisible();
    await expect(app.page.getByRole('button', {name: 'Add', exact: true})).toBeVisible();

    // No Delete button for new device
    await expect(app.page.getByRole('button', {name: 'Delete'})).not.toBeVisible();

    await app.page.getByRole('button', {name: 'Cancel'}).click();
    await app.page.waitForTimeout(300);
    await app.closeDeviceManager();
  });

  test('add a custom device and verify it appears in the list', async ({app}) => {
    await app.dismissModals();
    await app.openDeviceManager();

    await app.page.getByRole('button', {name: 'Add Custom Device'}).first().click();
    await app.page.waitForTimeout(500);

    // Fill in the form
    await app.page.getByLabel('Device Name').fill('My Test Device');
    await app.page.getByLabel('Device Width').fill('1024');
    await app.page.getByLabel('Device Height').fill('768');
    await app.page.getByLabel('Device DPR').fill('2');

    // Click Add
    await app.page.getByRole('button', {name: 'Add', exact: true}).click();
    await app.page.waitForTimeout(500);

    // The custom device should now appear in the CUSTOM DEVICES section
    const customSection = app.page.locator('#accordion-body-CUSTOM\\ DEVICES');
    await expect(customSection.getByText('My Test Device')).toBeVisible();
    await expect(customSection.getByText('1024x768')).toBeVisible();

    // Empty state message should be gone
    await expect(customSection.getByText('No custom devices added yet!')).not.toBeVisible();

    await app.closeDeviceManager();
  });

  test('custom device renders as webview with correct dimensions after closing device manager', async ({
    app,
  }) => {
    await app.dismissModals();
    await app.openDeviceManager();

    // Add a custom device with known dimensions
    await app.page.getByRole('button', {name: 'Add Custom Device'}).first().click();
    await app.page.waitForTimeout(500);
    await app.page.getByLabel('Device Name').fill('Dimension Test Device');
    await app.page.getByLabel('Device Width').fill('500');
    await app.page.getByLabel('Device Height').fill('700');
    await app.page.getByRole('button', {name: 'Add', exact: true}).click();
    await app.page.waitForTimeout(500);

    // Close device manager to return to browser view
    await app.closeDeviceManager();

    // The new device should appear as a webview — find it by checking all webviews
    // The webview width attribute should match the device width
    const webviews = app.page.locator('webview');
    const count = await webviews.count();
    expect(count).toBeGreaterThan(0);

    // Look for the webview with our custom dimensions
    let found = false;
    for (let i = 0; i < count; i++) {
      const wv = webviews.nth(i);
      const style = await wv.getAttribute('style');
      if (style?.includes('width: 500px') && style?.includes('height: 700px')) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  test('edit custom device changes its dimensions', async ({app}) => {
    await app.dismissModals();
    await app.openDeviceManager();

    // First add a device
    await app.page.getByRole('button', {name: 'Add Custom Device'}).first().click();
    await app.page.waitForTimeout(500);
    await app.page.getByLabel('Device Name').fill('Edit Me Device');
    await app.page.getByLabel('Device Width').fill('800');
    await app.page.getByLabel('Device Height').fill('600');
    await app.page.getByRole('button', {name: 'Add', exact: true}).click();
    await app.page.waitForTimeout(500);

    // Verify it exists
    const customSection = app.page.locator('#accordion-body-CUSTOM\\ DEVICES');
    await expect(customSection.getByText('Edit Me Device')).toBeVisible();
    await expect(customSection.getByText('800x600')).toBeVisible();

    // Click the edit button (pencil icon) on the custom device label
    // DeviceLabel uses w-fit class, distinguishing it from parent containers
    const deviceLabel = customSection.locator('.w-fit').filter({hasText: 'Edit Me Device'});
    await deviceLabel.locator('button').click();
    await app.page.waitForTimeout(500);

    // Modal title should say "Device Details" for editing
    await expect(app.page.getByRole('heading', {name: 'Device Details'})).toBeVisible();

    // Buttons should show "Save" instead of "Add", and "Delete" should be visible
    await expect(app.page.getByRole('button', {name: 'Save'})).toBeVisible();
    await expect(app.page.getByRole('button', {name: 'Delete'})).toBeVisible();

    // Change dimensions
    await app.page.getByLabel('Device Width').fill('1200');
    await app.page.getByLabel('Device Height').fill('900');

    // Save
    await app.page.getByRole('button', {name: 'Save'}).click();
    await app.page.waitForTimeout(500);

    // Verify the updated dimensions
    await expect(customSection.getByText('1200x900')).toBeVisible();
    await expect(customSection.getByText('800x600')).not.toBeVisible();

    await app.closeDeviceManager();
  });

  test('delete custom device removes it from the list', async ({app}) => {
    await app.dismissModals();
    await app.openDeviceManager();

    // Add a device
    await app.page.getByRole('button', {name: 'Add Custom Device'}).first().click();
    await app.page.waitForTimeout(500);
    await app.page.getByLabel('Device Name').fill('Delete Me Device');
    await app.page.getByLabel('Device Width').fill('640');
    await app.page.getByLabel('Device Height').fill('480');
    await app.page.getByRole('button', {name: 'Add', exact: true}).click();
    await app.page.waitForTimeout(500);

    const customSection = app.page.locator('#accordion-body-CUSTOM\\ DEVICES');
    await expect(customSection.getByText('Delete Me Device')).toBeVisible();

    // Open edit modal for the device
    const deviceLabel = customSection.locator('.w-fit').filter({hasText: 'Delete Me Device'});
    await deviceLabel.locator('button').click();
    await app.page.waitForTimeout(500);

    // Click Delete
    await app.page.getByRole('button', {name: 'Delete'}).click();
    await app.page.waitForTimeout(500);

    // Device should be removed
    await expect(customSection.getByText('Delete Me Device')).not.toBeVisible();

    // Empty state should return
    await expect(customSection.getByText('No custom devices added yet!')).toBeVisible();

    await app.closeDeviceManager();
  });

  test('duplicate name validation shows alert', async ({app}) => {
    await app.dismissModals();
    await app.openDeviceManager();

    // Add a device
    await app.page.getByRole('button', {name: 'Add Custom Device'}).first().click();
    await app.page.waitForTimeout(500);
    await app.page.getByLabel('Device Name').fill('Unique Device');
    await app.page.getByRole('button', {name: 'Add', exact: true}).click();
    await app.page.waitForTimeout(500);

    // Try to add another device with the same name
    await app.page.getByRole('button', {name: 'Add Custom Device'}).first().click();
    await app.page.waitForTimeout(500);
    await app.page.getByLabel('Device Name').fill('Unique Device');

    // window.alert is hijacked in the fixture — messages go to window.__e2eAlerts
    await app.clearAlerts();
    await app.page.getByRole('button', {name: 'Add', exact: true}).click();
    await app.page.waitForTimeout(300);

    const alerts = await app.getAlerts();
    expect(alerts.length).toBe(1);
    expect(alerts[0]).toContain('already exists');

    // Cancel out of the modal
    await app.page.getByRole('button', {name: 'Cancel'}).click();
    await app.page.waitForTimeout(300);
    await app.closeDeviceManager();
  });

  test('changing device type to Desktop auto-populates desktop user agent and unchecks touch/mobile', async ({
    app,
  }) => {
    await app.dismissModals();
    await app.openDeviceManager();

    await app.page.getByRole('button', {name: 'Add Custom Device'}).first().click();
    await app.page.waitForTimeout(500);

    // Default type is phone — touch and mobile should be checked
    await expect(app.page.getByLabel('Touch Capable')).toBeChecked();
    await expect(app.page.getByLabel('Mobile Capable (Rotatable)')).toBeChecked();

    // The phone UA should be set
    const phoneUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X)';
    const uaInput = app.page.getByLabel('User Agent String');
    const initialUA = await uaInput.inputValue();
    expect(initialUA).toContain('iPhone');

    // Change to Desktop (notebook)
    await app.page.locator('#device-capabilities').selectOption('notebook');
    await app.page.waitForTimeout(300);

    // UA should switch to desktop
    const newUA = await uaInput.inputValue();
    expect(newUA).toContain('Macintosh');
    expect(newUA).not.toContain('iPhone');

    // Touch and mobile should be unchecked
    await expect(app.page.getByLabel('Touch Capable')).not.toBeChecked();
    await expect(app.page.getByLabel('Mobile Capable (Rotatable)')).not.toBeChecked();

    await app.page.getByRole('button', {name: 'Cancel'}).click();
    await app.page.waitForTimeout(300);
    await app.closeDeviceManager();
  });

  test('changing device type from Desktop to Phone re-enables touch/mobile and sets phone UA', async ({
    app,
  }) => {
    await app.dismissModals();
    await app.openDeviceManager();

    await app.page.getByRole('button', {name: 'Add Custom Device'}).first().click();
    await app.page.waitForTimeout(500);

    // Switch to Desktop first
    await app.page.locator('#device-capabilities').selectOption('notebook');
    await app.page.waitForTimeout(300);
    await expect(app.page.getByLabel('Touch Capable')).not.toBeChecked();

    // Switch back to Phone
    await app.page.locator('#device-capabilities').selectOption('phone');
    await app.page.waitForTimeout(300);

    const uaInput = app.page.getByLabel('User Agent String');
    const ua = await uaInput.inputValue();
    expect(ua).toContain('iPhone');

    await expect(app.page.getByLabel('Touch Capable')).toBeChecked();
    await expect(app.page.getByLabel('Mobile Capable (Rotatable)')).toBeChecked();

    await app.page.getByRole('button', {name: 'Cancel'}).click();
    await app.page.waitForTimeout(300);
    await app.closeDeviceManager();
  });

  test('custom device is added to the active suite and renders webview', async ({app}) => {
    await app.dismissModals();
    await app.openDeviceManager();

    // Count current webviews before adding
    const initialWebviewCount = await app.page.locator('webview').count();

    // Add a custom device
    await app.page.getByRole('button', {name: 'Add Custom Device'}).first().click();
    await app.page.waitForTimeout(500);
    await app.page.getByLabel('Device Name').fill('Suite Test Device');
    await app.page.getByLabel('Device Width').fill('375');
    await app.page.getByLabel('Device Height').fill('812');
    await app.page.getByRole('button', {name: 'Add', exact: true}).click();
    await app.page.waitForTimeout(500);

    // The checkbox should be checked (auto-added to active suite)
    const customSection = app.page.locator('#accordion-body-CUSTOM\\ DEVICES');
    const deviceLabel = customSection.locator('.w-fit').filter({hasText: 'Suite Test Device'});
    const checkbox = deviceLabel.locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();

    // Close device manager and verify the webview count increased
    await app.closeDeviceManager();
    // Wait for webviews to render after view transition
    await app.page.waitForTimeout(1000);

    const newWebviewCount = await app.page.locator('webview').count();
    expect(newWebviewCount).toBeGreaterThan(initialWebviewCount);
  });

  test('unchecking custom device removes it from active suite webviews', async ({app}) => {
    await app.dismissModals();

    // Capture initial webview count before any changes
    const initialCount = await app.page.locator('webview').count();

    await app.openDeviceManager();

    // Add a custom device (auto-checked into suite)
    await app.page.getByRole('button', {name: 'Add Custom Device'}).first().click();
    await app.page.waitForTimeout(500);
    await app.page.getByLabel('Device Name').fill('Uncheck Device');
    await app.page.getByLabel('Device Width').fill('320');
    await app.page.getByLabel('Device Height').fill('568');
    await app.page.getByRole('button', {name: 'Add', exact: true}).click();
    await app.page.waitForTimeout(500);

    // Immediately uncheck it while still in device manager
    const customSection = app.page.locator('#accordion-body-CUSTOM\\ DEVICES');
    const deviceLabel = customSection.locator('.w-fit').filter({hasText: 'Uncheck Device'});
    const checkbox = deviceLabel.locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await app.page.waitForTimeout(300);

    // Close device manager — webview count should match original (device was unchecked)
    await app.closeDeviceManager();
    await app.page.waitForTimeout(1000);
    const finalCount = await app.page.locator('webview').count();
    expect(finalCount).toBe(initialCount);
  });

  test('search filters custom devices', async ({app}) => {
    await app.dismissModals();
    await app.openDeviceManager();

    // Add two custom devices
    await app.page.getByRole('button', {name: 'Add Custom Device'}).first().click();
    await app.page.waitForTimeout(500);
    await app.page.getByLabel('Device Name').fill('Alpha Phone');
    await app.page.getByRole('button', {name: 'Add', exact: true}).click();
    await app.page.waitForTimeout(500);

    await app.page.getByRole('button', {name: 'Add Custom Device'}).first().click();
    await app.page.waitForTimeout(500);
    await app.page.getByLabel('Device Name').fill('Beta Tablet');
    await app.page.getByRole('button', {name: 'Add', exact: true}).click();
    await app.page.waitForTimeout(500);

    const customSection = app.page.locator('#accordion-body-CUSTOM\\ DEVICES');
    await expect(customSection.getByText('Alpha Phone')).toBeVisible();
    await expect(customSection.getByText('Beta Tablet')).toBeVisible();

    // Search for "Alpha"
    const searchInput = app.page.locator('input[placeholder="Search ..."]');
    await searchInput.fill('Alpha');
    await app.page.waitForTimeout(300);

    await expect(customSection.getByText('Alpha Phone')).toBeVisible();
    await expect(customSection.getByText('Beta Tablet')).not.toBeVisible();

    // Clear search
    await searchInput.fill('');
    await app.page.waitForTimeout(300);

    await expect(customSection.getByText('Alpha Phone')).toBeVisible();
    await expect(customSection.getByText('Beta Tablet')).toBeVisible();

    await app.closeDeviceManager();
  });

  test('cancel button closes modal without saving', async ({app}) => {
    await app.dismissModals();
    await app.openDeviceManager();

    await app.page.getByRole('button', {name: 'Add Custom Device'}).first().click();
    await app.page.waitForTimeout(500);

    await app.page.getByLabel('Device Name').fill('Should Not Save');
    await app.page.getByRole('button', {name: 'Cancel'}).click();
    // Wait for modal close animation (200ms leave transition)
    await expect(app.page.getByLabel('Device Name')).not.toBeVisible();

    const customSection = app.page.locator('#accordion-body-CUSTOM\\ DEVICES');
    await expect(customSection.getByText('Should Not Save')).not.toBeVisible();

    await app.closeDeviceManager();
  });
});
