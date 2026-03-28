import {defineConfig} from '@playwright/test';
import os from 'os';

// Test files ordered by duration (slowest first) so long-running files
// get scheduled onto workers early, minimizing total wall-clock time.
const testOrder = [
  'device-interaction-mirroring.spec.ts',
  'cross-device-mirroring.spec.ts',
  'color-blindness.spec.ts',
  'inspect-elements.spec.ts',
  'navigation-controls-extended.spec.ts',
  'device-color-scheme.spec.ts',
  'screenshot.spec.ts',
  'screenshot-save.spec.ts',
  'file-watching.spec.ts',
  'insecure-ssl.spec.ts',
  'custom-device-creation.spec.ts',
  'bookmarks.spec.ts',
  'error-handling.spec.ts',
  'webview-interaction.spec.ts',
  'preview-layout.spec.ts',
  'menu-flyout.spec.ts',
  'url-navigation.spec.ts',
  'address-bar-features.spec.ts',
  'device-toolbar.spec.ts',
  'zoom-controls.spec.ts',
  'ui-theme.spec.ts',
  'settings.spec.ts',
  'about-dialog.spec.ts',
  'rotate-devices.spec.ts',
  'keyboard-shortcuts-modal.spec.ts',
  'preview-suites.spec.ts',
  'device-manager-extended.spec.ts',
  'device-manager.spec.ts',
  'app-launch.spec.ts',
];

export default defineConfig({
  testDir: './tests',
  testMatch: testOrder,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: process.env.E2E_WORKERS ? Number(process.env.E2E_WORKERS) : os.cpus().length * 2,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', {open: 'never'}]] : [['html', {open: 'never'}]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
