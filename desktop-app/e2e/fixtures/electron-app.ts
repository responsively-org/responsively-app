import {test as base, ElectronApplication, Page, _electron} from '@playwright/test';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {ResponsivelyApp} from '../models/app';

type ElectronFixtures = {
  electronApp: ElectronApplication;
  mainWindow: Page;
  app: ResponsivelyApp;
  testServerUrl: string;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const test = base.extend<{}, ElectronFixtures>({
  electronApp: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'responsively-e2e-'));

      // Pre-populate electron-store config with a local homepage
      // so tests don't depend on external network (google.com)
      const testPagePath = path.join(__dirname, 'pages', 'test-page.html');
      const homepage = `file://${testPagePath}`;
      fs.writeFileSync(path.join(userDataDir, 'config.json'), JSON.stringify({homepage}));

      const env: Record<string, string> = {
        ...process.env,
        NODE_ENV: 'production',
        E2E_TEST: 'true',
        E2E_USER_DATA_DIR: userDataDir,
      } as Record<string, string>;
      if (process.env.E2E_HEADLESS === 'true' || process.env.CI) {
        env.E2E_HEADLESS = 'true';
      }
      const electronApp = await _electron.launch({
        args: [path.join(__dirname, '../../release/app')],
        env,
      });

      await use(electronApp);

      const timeout = (ms: number) =>
        new Promise((_resolve, reject) => setTimeout(() => reject(new Error('timeout')), ms));
      await Promise.race([electronApp.evaluate(({app}) => app.quit()), timeout(5000)]).catch(
        () => {}
      );
      await Promise.race([electronApp.close(), timeout(5000)]).catch(() => {});
      try {
        fs.rmSync(userDataDir, {recursive: true, force: true});
      } catch {
        // Electron may still hold file locks; ignore cleanup errors
      }
    },
    {scope: 'worker'},
  ],

  mainWindow: [
    async ({electronApp}, use) => {
      const window = await electronApp.firstWindow();

      await window.waitForLoadState('domcontentloaded');

      await window.waitForSelector('[data-testid="address-bar"]', {
        timeout: 60_000,
      });

      // Initialize the showItemInFolder call log (populated by screenshot handler
      // when E2E_TEST=true — see src/main/screenshot/index.ts).
      await electronApp.evaluate(() => {
        (global as any).__e2eShowItemCalls = [] as string[];
      });

      // Hijack window.alert so it never blocks the renderer.
      // Messages are stored in window.__e2eAlerts for test assertions.
      await window.evaluate(() => {
        const w = globalThis as any;
        w.__e2eAlerts = [] as string[];
        w.alert = (msg: string) => {
          w.__e2eAlerts.push(msg);
        };
      });

      await use(window);
    },
    {scope: 'worker'},
  ],

  app: [
    async ({mainWindow, electronApp}, use) => {
      await use(new ResponsivelyApp(mainWindow, electronApp));
    },
    {scope: 'worker'},
  ],

  testServerUrl: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const fixturesDir = path.join(__dirname, 'pages');
      const server = http.createServer((req, res) => {
        const requested = req.url === '/' ? 'test-page.html' : req.url!;
        const filePath = path.resolve(fixturesDir, path.basename(requested));
        if (!filePath.startsWith(fixturesDir)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }
        const ext = path.extname(filePath);
        const contentType = ext === '.html' ? 'text/html' : 'application/octet-stream';
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
          }
          res.writeHead(200, {'Content-Type': contentType});
          res.end(data);
        });
      });

      await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', () => resolve());
      });

      const addr = server.address() as {port: number};
      const url = `http://127.0.0.1:${addr.port}`;

      await use(url);

      server.close();
    },
    {scope: 'worker'},
  ],
});

export {expect} from '@playwright/test';
