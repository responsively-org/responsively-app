import {test, expect} from '../fixtures/electron-app';

test.describe('Device Manager — Extended', () => {
  test('the grid lists devices with membership state', async ({app}) => {
    await app.dismissModals();
    await app.openDeviceManager();

    const cards = app.page.locator('[data-testid^="device-card-"]');
    expect(await cards.count()).toBeGreaterThan(0);

    // At least one device belongs to the active suite.
    const members = app.page.locator('[data-testid^="device-card-"][aria-pressed="true"]');
    expect(await members.count()).toBeGreaterThan(0);

    await app.closeDeviceManager();
  });

  test('toggling a device card adds and removes it from the active suite', async ({app}) => {
    await app.dismissModals();
    await app.ensureDeviceManagerOpen();

    const membersBefore = await app.page
      .locator('[data-testid^="device-card-"][aria-pressed="true"]')
      .count();

    // Pin the exact card: once clicked it becomes a member, so a
    // `[aria-pressed="false"]` locator would re-resolve to a different one.
    const testId = await app.page
      .locator('[data-testid^="device-card-"][aria-pressed="false"]')
      .first()
      .getAttribute('data-testid');
    const card = app.page.locator(`[data-testid="${testId}"]`);
    await card.click();

    await expect
      .poll(() => app.page.locator('[data-testid^="device-card-"][aria-pressed="true"]').count())
      .toBe(membersBefore + 1);

    // Toggle it back so the next spec file inherits the original suite.
    await card.click();
    await expect
      .poll(() => app.page.locator('[data-testid^="device-card-"][aria-pressed="true"]').count())
      .toBe(membersBefore);

    await app.closeDeviceManager();
  });

  test('the last device of a suite cannot be removed', async ({app}) => {
    await app.dismissModals();
    await app.ensureDeviceManagerOpen();

    const members = app.page.locator('[data-testid^="device-card-"][aria-pressed="true"]');
    if ((await members.count()) === 1) {
      await expect(members.first()).toBeDisabled();
    }

    await app.closeDeviceManager();
  });

  test('the suites column lists suites and can create one', async ({app}) => {
    await app.dismissModals();
    await app.ensureDeviceManagerOpen();

    const suiteRows = app.page.locator('[data-testid^="suite-row-"]');
    const before = await suiteRows.count();
    expect(before).toBeGreaterThan(0);

    await app.deviceManagerSheet.getByRole('button', {name: 'New suite'}).click();
    await expect.poll(() => suiteRows.count(), {timeout: 10_000}).toBe(before + 1);

    // Remove the suite we just made — suites persist across spec files.
    await app.page
      .locator('[data-testid^="suite-row-"]')
      .last()
      .locator('..')
      .locator('button[title="Delete suite"]')
      .click();
    await expect.poll(() => suiteRows.count(), {timeout: 10_000}).toBe(before);

    await app.closeDeviceManager();
  });

  test('the default suite cannot be deleted', async ({app}) => {
    await app.dismissModals();
    await app.ensureDeviceManagerOpen();

    const defaultRow = app.page.locator('[data-testid="suite-row-default"]');
    if ((await defaultRow.count()) > 0) {
      const deleteBtn = defaultRow
        .locator('..')
        .locator('button[title="Default suite can\'t be deleted"]');
      await expect(deleteBtn).toBeDisabled();
    }

    await app.closeDeviceManager();
  });
});
