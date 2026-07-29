import {defineConfig} from '@playwright/test';
import os from 'os';

const availableCores =
  typeof os.availableParallelism === 'function' ? os.availableParallelism() : os.cpus().length;

// Test files ordered by duration (slowest first) so long-running files
// get scheduled onto workers early, minimizing total wall-clock time.
const testOrder = [
  'device-interaction-mirroring.spec.ts',
  'cross-device-mirroring.spec.ts',
  'color-blindness.spec.ts',
  'inspect-elements.spec.ts',
  'navigation-controls-extended.spec.ts',
  'device-color-scheme.spec.ts',
  'mcp-server.spec.ts',
  'mcp-bridge-stdio.spec.ts',
  'mcp-manifest.spec.ts',
  'mcp-panel.spec.ts',
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
  'popup-policy.spec.ts',
  'title-bar.spec.ts',
  'status-bar.spec.ts',
  'devtools-overlay.spec.ts',
  'shortcut-forwarding.spec.ts',
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
  // Each worker boots a whole Electron app — main process, app renderer, one
  // renderer per preview webview, plus a GPU process — so a worker is an
  // order of magnitude heavier than a typical unit-test worker. Oversubscribing
  // (this was cpus*2, i.e. 32 apps on a 16-core machine) starves the box and
  // shows up as boot-storm flakes: BrowserSync never initialising, worker
  // teardown timeouts, and unrelated specs timing out. Half the cores, capped,
  // keeps runs reproducible. availableParallelism respects container limits.
  workers: process.env.E2E_WORKERS
    ? Number(process.env.E2E_WORKERS)
    : Math.max(2, Math.min(8, Math.floor(availableCores / 2))),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', {open: 'never'}]] : [['html', {open: 'never'}]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
