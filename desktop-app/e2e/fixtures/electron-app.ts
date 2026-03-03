import {test as base, ElectronApplication, Page, _electron} from '@playwright/test';
import path from 'path';

type ElectronFixtures = {
  electronApp: ElectronApplication;
  mainWindow: Page;
};

export const test = base.extend<Record<string, never>, ElectronFixtures>({
  electronApp: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const electronApp = await _electron.launch({
        args: [path.join(__dirname, '../../release/app')],
        env: {
          ...process.env,
          NODE_ENV: 'production',
          E2E_TEST: 'true',
        },
      });

      await use(electronApp);

      await electronApp.evaluate(({app}) => app.quit()).catch(() => {});
      await electronApp.close().catch(() => {});
    },
    {scope: 'worker'},
  ],

  mainWindow: [
    async ({electronApp}, use) => {
      const window = await electronApp.firstWindow();

      await window.waitForLoadState('domcontentloaded');
      await window.waitForSelector('[data-testid="address-bar"]', {
        timeout: 30_000,
      });

      await use(window);
    },
    {scope: 'worker'},
  ],
});

export {expect} from '@playwright/test';
