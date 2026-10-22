import {test, expect} from '../fixtures/electron-app';
import type {ResponsivelyApp} from '../models/app';

/**
 * Regression cover for #1175: key events that land inside a preview webview
 * never reach the renderer's Mousetrap handlers, so the main process matches
 * them (`before-input-event`) and forwards them back.
 *
 * The keystroke must be injected into the guest itself — Playwright's
 * page.keyboard dispatches to the host renderer, which would take the normal
 * path and prove nothing.
 */
const pressInsideGuest = async (
  app: ResponsivelyApp,
  keyCode: string,
  modifiers: string[]
): Promise<void> => {
  await app.electronApp.evaluate(
    ({webContents}, {keyCode: code, modifiers: mods}) => {
      const guest = webContents
        .getAllWebContents()
        .filter((wc: Electron.WebContents) => (wc as any).getType() === 'webview')[0];
      if (guest === undefined) {
        throw new Error('no preview webview attached');
      }
      guest.focus();
      guest.sendInputEvent({
        type: 'keyDown',
        keyCode: code,
        modifiers: mods as any,
      });
      guest.sendInputEvent({type: 'keyUp', keyCode: code, modifiers: mods as any});
    },
    {keyCode, modifiers}
  );
};

test.describe('Shortcut forwarding from webviews', () => {
  const mod = process.platform === 'darwin' ? 'meta' : 'control';

  test.beforeAll(async ({app, testServerUrl}) => {
    await app.dismissModals();
    await app.navigateTo(`${testServerUrl}/test-page.html`);
    await expect(app.addressBar).toHaveValue(/test-page\.html/, {timeout: 15_000});
  });

  test('zoom out fires when the keystroke lands inside a preview', async ({app}) => {
    const zoomLevel = app.page.locator('[data-testid="zoom-level"]');
    const before = parseInt((await zoomLevel.innerText()).replace('%', ''), 10);

    await pressInsideGuest(app, '-', [mod]);

    await expect
      .poll(async () => parseInt((await zoomLevel.innerText()).replace('%', ''), 10), {
        timeout: 10_000,
      })
      .toBeLessThan(before);
  });

  test('rotate fires when the keystroke lands inside a preview', async ({app}) => {
    const rotateBtn = app.page.locator('button[title="Rotate Devices"]');
    const before = await rotateBtn.getAttribute('aria-pressed');

    await pressInsideGuest(app, 'r', [mod, 'alt']);

    await expect
      .poll(() => rotateBtn.getAttribute('aria-pressed'), {timeout: 10_000})
      .not.toBe(before);

    // Rotation is global and workers are shared across spec files, so leaving
    // it on changes device dimensions for whatever runs next in this worker.
    await rotateBtn.click();
    await expect.poll(() => rotateBtn.getAttribute('aria-pressed'), {timeout: 10_000}).toBe(before);
  });

  test('plain typing inside a preview is not hijacked', async ({app}) => {
    const zoomLevel = app.page.locator('[data-testid="zoom-level"]');
    const before = await zoomLevel.innerText();

    await pressInsideGuest(app, 'r', []);
    await app.page.waitForTimeout(500);

    await expect(zoomLevel).toHaveText(before);
  });
});
