import {test, expect} from '../fixtures/electron-app';
import type {ResponsivelyApp} from '../models/app';

type Bookmark = {id: string; name: string; address: string};

const readBookmarks = (app: ResponsivelyApp): Promise<Bookmark[]> =>
  app.page.evaluate(() => (window as any).electron.store.get('bookmarks') ?? []);

async function navigateTo(app: ResponsivelyApp, url: string) {
  await app.navigateTo(url);
  await expect.poll(() => app.firstWebview.evaluate((view: any) => view.getURL())).toBe(url);
}

test.describe('Bookmarks', () => {
  test.describe.configure({mode: 'parallel'});

  test('star immediately saves the current page and Escape keeps it bookmarked', async ({
    app,
    testServerUrl,
  }) => {
    await app.dismissModals();
    const url = `${testServerUrl}/test-page.html#bookmark-click`;
    await navigateTo(app, url);
    await app.page.getByTitle('Add bookmark', {exact: true}).click();

    await expect
      .poll(async () => (await readBookmarks(app)).filter((b) => b.address === url))
      .toHaveLength(1);
    await expect(app.page.getByTitle('Edit bookmark', {exact: true})).toBeVisible();
    await expect(app.page.getByLabel('Bookmark Name')).toBeVisible();
    await expect(app.page.getByLabel('Address', {exact: true})).toHaveValue(url);

    await app.page.keyboard.press('Escape');
    await expect(app.page.getByLabel('Bookmark Name')).toBeHidden();
    await expect(app.page.getByTitle('Edit bookmark', {exact: true})).toBeVisible();

    await navigateTo(app, `${testServerUrl}/test-page-2.html`);
    await expect(app.page.getByTitle('Add bookmark', {exact: true})).toBeVisible();
    await navigateTo(app, url);
    await expect(app.page.getByTitle('Edit bookmark', {exact: true})).toBeVisible();
  });

  test('Cmd/Ctrl+D adds once and opens the existing bookmark for editing', async ({
    app,
    testServerUrl,
  }) => {
    await app.dismissModals();
    const url = `${testServerUrl}/test-page.html#bookmark-shortcut`;
    await navigateTo(app, url);
    await app.pressShortcut('d');
    await expect(app.page.getByLabel('Bookmark Name')).toBeVisible();
    await expect
      .poll(async () => (await readBookmarks(app)).filter((b) => b.address === url))
      .toHaveLength(1);
    await app.page.keyboard.press('Escape');
    await app.pressShortcut('d');
    await expect(app.page.getByLabel('Bookmark Name')).toBeVisible();
    await app.page.getByLabel('Bookmark Name').fill('Keyboard bookmark');
    await app.pressShortcut('d');
    await expect(app.page.getByLabel('Bookmark Name')).toHaveValue('Keyboard bookmark');
    await app.page.getByLabel('Bookmark Name').press('Enter');

    await expect(app.page.getByLabel('Bookmark Name')).toBeHidden();
    await expect
      .poll(async () => (await readBookmarks(app)).filter((b) => b.address === url))
      .toEqual([expect.objectContaining({name: 'Keyboard bookmark', address: url})]);
  });

  test('editing and dismissing with Escape or an outside click saves the name', async ({
    app,
    testServerUrl,
  }) => {
    await app.dismissModals();
    const url = `${testServerUrl}/test-page.html#bookmark-dismiss`;
    await navigateTo(app, url);
    await app.page.getByTitle('Add bookmark', {exact: true}).click();
    await app.page.getByLabel('Bookmark Name').fill('Saved with Escape');
    await app.page.keyboard.press('Escape');
    await expect
      .poll(async () => (await readBookmarks(app)).find((b) => b.address === url)?.name)
      .toBe('Saved with Escape');

    await app.page.getByTitle('Edit bookmark', {exact: true}).click();
    await app.page.getByLabel('Bookmark Name').fill('Saved by clicking outside');
    await app.addressBar.click();
    await expect(app.page.getByLabel('Bookmark Name')).toBeHidden();
    await expect
      .poll(async () => (await readBookmarks(app)).find((b) => b.address === url)?.name)
      .toBe('Saved by clicking outside');

    await app.page.getByTitle('Edit bookmark', {exact: true}).click();
    await app.page.getByLabel('Bookmark Name').fill('Saved by clicking the star');
    await app.page.getByTitle('Edit bookmark', {exact: true}).click();
    await expect(app.page.getByLabel('Bookmark Name')).toBeHidden();
    await expect
      .poll(async () => (await readBookmarks(app)).find((b) => b.address === url)?.name)
      .toBe('Saved by clicking the star');
  });

  test('clicking a preview dismisses the editor and saves its edits', async ({
    app,
    testServerUrl,
  }) => {
    await app.dismissModals();
    const url = `${testServerUrl}/test-page.html#bookmark-preview-click`;
    await navigateTo(app, url);
    await app.page.getByTitle('Add bookmark', {exact: true}).click();
    await app.page.getByLabel('Bookmark Name').fill('Saved from preview');
    await app.firstWebview.click({position: {x: 40, y: 150}});

    await expect(app.page.getByLabel('Bookmark Name')).toBeHidden();
    await expect
      .poll(async () => (await readBookmarks(app)).find((b) => b.address === url)?.name)
      .toBe('Saved from preview');
  });

  test('Done updates a bookmark URL without duplicating it', async ({app, testServerUrl}) => {
    await app.dismissModals();
    const url = `${testServerUrl}/test-page.html#bookmark-edit-url`;
    const newUrl = `${testServerUrl}/test-page-2.html#bookmark-edited`;
    await navigateTo(app, url);
    await app.page.getByTitle('Add bookmark', {exact: true}).click();
    await expect
      .poll(async () => (await readBookmarks(app)).find((b) => b.address === url)?.id)
      .toBeTruthy();
    const bookmark = (await readBookmarks(app)).find((b) => b.address === url)!;
    await app.page.getByLabel('Bookmark Name').fill('Edited bookmark');
    await app.page.getByLabel('Address', {exact: true}).fill(newUrl);
    await app.page.getByRole('button', {name: 'Done', exact: true}).click();

    await expect(app.page.getByTitle('Add bookmark', {exact: true})).toBeVisible();
    await expect
      .poll(async () => (await readBookmarks(app)).filter((b) => b.id === bookmark.id))
      .toEqual([{id: bookmark.id, name: 'Edited bookmark', address: newUrl}]);
    await expect
      .poll(async () => (await readBookmarks(app)).filter((b) => b.address === url))
      .toHaveLength(0);
    await navigateTo(app, newUrl);
    await expect(app.page.getByTitle('Edit bookmark', {exact: true})).toBeVisible();
  });

  test('Remove deletes the bookmark and restores the empty star', async ({app, testServerUrl}) => {
    await app.dismissModals();
    const url = `${testServerUrl}/test-page.html#bookmark-remove`;
    await navigateTo(app, url);
    await app.page.getByTitle('Add bookmark', {exact: true}).click();
    await app.page.getByRole('button', {name: 'Done', exact: true}).click();
    await app.page.getByTitle('Edit bookmark', {exact: true}).click();
    await app.page.getByRole('button', {name: 'Remove', exact: true}).click();

    await expect(app.page.getByLabel('Bookmark Name')).toBeHidden();
    await expect(app.page.getByTitle('Add bookmark', {exact: true})).toBeVisible();
    await expect
      .poll(async () => (await readBookmarks(app)).filter((b) => b.address === url))
      .toHaveLength(0);
    await navigateTo(app, `${testServerUrl}/test-page-2.html`);
    await navigateTo(app, url);
    await expect(app.page.getByTitle('Add bookmark', {exact: true})).toBeVisible();
  });

  test('clicking a saved bookmark in the menu navigates the previews', async ({
    app,
    testServerUrl,
  }) => {
    await app.dismissModals();
    const url = `${testServerUrl}/test-page.html#bookmark-menu`;
    await navigateTo(app, url);
    await app.page.getByTitle('Add bookmark', {exact: true}).click();
    await app.page.getByLabel('Bookmark Name').fill('Menu navigation bookmark');
    await app.page.getByRole('button', {name: 'Done', exact: true}).click();
    await navigateTo(app, `${testServerUrl}/test-page-2.html`);
    await app.openMenuFlyout();
    await app.page.getByRole('button', {name: 'Bookmarks', exact: true}).hover();
    await app.page.getByRole('button', {name: 'Menu navigation bookmark', exact: true}).click();

    await expect(app.addressBar).toHaveValue(url);
    await expect.poll(() => app.firstWebview.evaluate((view: any) => view.getURL())).toBe(url);
    await expect(app.page.getByTitle('Edit bookmark', {exact: true})).toBeVisible();
  });
});
