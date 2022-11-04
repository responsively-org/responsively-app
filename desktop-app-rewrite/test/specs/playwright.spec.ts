import { AppPageObject } from '../pageobjects/app';

const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');

const getApp = async (): Promise<AppPageObject> => {
  const electronApp = await electron.launch({
    args: ['./release/app/dist/main/main.js'],
    cwd: '/Users/manoj/workspace/responsively-app/desktop-app-rewrite/',
  });

  // Wait for the first BrowserWindow to open
  // and return its Page object
  electronApp.on('console', console.log);
  const window = await electronApp.firstWindow();
  window.on('console', console.log);
  await window.waitForLoadState();
  console.log('App loaded');

  const app = new AppPageObject(window, electronApp);
  return app;
};

test('Load google.com', async ({ page }) => {
  const app = await getApp();
  //await new Promise((resolve) => setTimeout(resolve, 5000));
  try {
    console.log('Going to google.com');
    await app.goto('https://google.com');
    console.log('Going to google.com ...done');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log(
      'First device URL',
      await (await app.getFirstDevice()).getURL()
    );
    await page.screenshot({ path: 'google.png' });

    // close app
    await app.close();
  } catch (e) {
    console.log('Error running test', e);
  }
});
