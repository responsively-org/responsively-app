import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type {ElectronApplication, Page} from '@playwright/test';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import {pathToFileURL} from 'url';
import {expect, test} from '../fixtures/electron-app';

const DEFAULT_DEVICE_IDS = ['10008', '10013', '10015'];
const DEFAULT_DEVICE_NAMES = ['iPhone 12 Pro', 'iPad', 'MacBook Pro'];

interface ActiveDeviceState {
  id: string;
  name: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  colorScheme: 'light' | 'dark' | 'system';
  mirroringEnabled: boolean;
}

interface PreviewMetrics {
  width: number;
  height: number;
  dark: boolean;
}

interface TextBlock {
  type: 'text';
  text: string;
}

interface ImageBlock {
  type: 'image';
  data: string;
  mimeType: string;
}

type ContentBlock = TextBlock | ImageBlock;

const connectClient = async (mcpPort: number): Promise<Client> => {
  const client = new Client({name: 'responsively-e2e', version: '1.0.0'});
  const transport = new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${mcpPort}/mcp`));
  await client.connect(transport);
  return client;
};

const callTool = async (client: Client, name: string, args: Record<string, unknown> = {}) => {
  const result = await client.callTool({name, arguments: args});
  return {content: result.content as ContentBlock[], isError: result.isError === true};
};

const firstTextJson = (content: ContentBlock[]) => {
  const block = content.find((c): c is TextBlock => c.type === 'text');
  if (block === undefined) {
    throw new Error('Tool result contains no text block');
  }
  return JSON.parse(block.text);
};

// DOM order identifies the named preview even when guests were recreated or
// several presets share a user agent. Read actual browser state, not Redux.
const readPreview = async <T>(
  mainWindow: Page,
  electronApp: ElectronApplication,
  deviceName: string,
  script: string
): Promise<T> => {
  const id = await mainWindow.locator('webview').evaluateAll((elements, name) => {
    const preview = elements.find((element) => element.id === name) as
      Electron.WebviewTag | undefined;
    if (!preview) throw new Error(`Preview not found: ${name}`);
    return preview.getWebContentsId();
  }, deviceName);
  return electronApp.evaluate(
    ({webContents}, target) => {
      const preview = webContents.fromId(target.id);
      if (!preview) throw new Error('Preview was closed');
      return preview.executeJavaScript(target.script);
    },
    {id, script}
  );
};

const PREVIEW_METRICS_SCRIPT = `({
  width: innerWidth, height: innerHeight,
  dark: matchMedia('(prefers-color-scheme: dark)').matches
})`;

const restoreDeviceControls = async (client: Client) => {
  for (const device of DEFAULT_DEVICE_IDS) {
    await callTool(client, 'set_device_options', {device, reset: true});
  }
  await callTool(client, 'set_mirroring', {enabled: true});
};

test.describe('MCP server', () => {
  let client: Client;

  test.beforeAll(async ({mainWindow, mcpPort, testServerUrl}) => {
    // mainWindow dependency ensures the renderer (and its MCP bridge) is up.
    await mainWindow.waitForSelector('webview');
    client = await connectClient(mcpPort);
    // Playwright reuses workers across spec files and the worker-scoped app
    // instance persists with them, so earlier files may have navigated away
    // or changed the device set. Normalize the state this spec asserts on,
    // using the tools themselves.
    await callTool(client, 'set_active_devices', {devices: DEFAULT_DEVICE_IDS});
    await restoreDeviceControls(client);
    await callTool(client, 'navigate', {url: `${testServerUrl}/test-page.html`});
    // Defense in depth: a predecessor file may have left inspect mode on,
    // whose CDP overlay consumes the trusted clicks the click tool sends.
    const inspectBtn = mainWindow.locator('button[title="Inspect Elements"]');
    if ((await inspectBtn.getAttribute('aria-pressed')) === 'true') {
      await inspectBtn.click();
      await mainWindow.waitForTimeout(200);
    }
  });

  test.afterAll(async () => {
    if (client) {
      try {
        await restoreDeviceControls(client);
      } finally {
        await client.close();
      }
    }
  });

  test('lists the available tools', async () => {
    const {tools} = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'click',
      'get_app_state',
      'list_devices',
      'navigate',
      'read_page',
      'screenshot',
      'scroll_to',
      'set_active_devices',
      'set_device_options',
      'set_mirroring',
      'type_text',
    ]);
  });

  test('get_app_state reports the current URL and active devices', async () => {
    const {content, isError} = await callTool(client, 'get_app_state');
    expect(isError).toBe(false);
    const state = firstTextJson(content);
    expect(state.url).toContain('test-page.html');
    expect(state.activeDevices.map((device: {id: string}) => device.id)).toEqual(
      DEFAULT_DEVICE_IDS
    );
    expect(state.activeDevices[0].width).toBeGreaterThan(0);
  });

  test('list_devices returns the catalog with active flags', async () => {
    const {content, isError} = await callTool(client, 'list_devices');
    expect(isError).toBe(false);
    const devices = firstTextJson(content);
    expect(devices.length).toBeGreaterThan(50);
    const active = devices.filter((device: {isActive: boolean}) => device.isActive);
    expect(active.map((device: {id: string}) => device.id).sort()).toEqual(DEFAULT_DEVICE_IDS);
    const iPhone = devices.find((device: {id: string}) => device.id === '10008');
    expect(iPhone.name).toBe('iPhone 12 Pro');
  });

  test('navigate loads a URL across the previews', async ({app, testServerUrl}) => {
    const {content, isError} = await callTool(client, 'navigate', {
      url: `${testServerUrl}/test-page-2.html`,
    });
    expect(isError).toBe(false);
    const result = firstTextJson(content);
    expect(result.loaded).toBe(true);
    expect(result.url).toContain('test-page-2.html');
    await expect(app.addressBar).toHaveValue(/test-page-2\.html/);
  });

  test('navigate recognizes browser-normalized URLs without a trailing slash', async ({
    testServerUrl,
  }) => {
    const result = await callTool(client, 'navigate', {url: testServerUrl});
    expect(result.isError).toBe(false);
    expect(firstTextJson(result.content)).toMatchObject({url: `${testServerUrl}/`, loaded: true});
  });

  test('navigate rejects disallowed URL schemes', async () => {
    const {content, isError} = await callTool(client, 'navigate', {
      url: 'javascript:alert(1)',
    });
    expect(isError).toBe(true);
    expect((content[0] as TextBlock).text).toContain('Unsupported URL scheme');
  });

  test.describe('local file:// access (#1559)', () => {
    let dir: string;
    let pageUrl: string;
    let notesUrl: string;

    test.beforeAll(() => {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-file-e2e-'));
      fs.writeFileSync(path.join(dir, 'notes.txt'), 'top secret notes');
      fs.writeFileSync(
        path.join(dir, 'page.html'),
        '<title>Local page</title><h1>Local page</h1><a id="notes" href="notes.txt">Notes</a>'
      );
      pageUrl = pathToFileURL(path.join(dir, 'page.html')).href;
      notesUrl = pathToFileURL(path.join(dir, 'notes.txt')).href;
    });

    test.afterAll(async ({testServerUrl}) => {
      await callTool(client, 'navigate', {url: `${testServerUrl}/test-page.html`});
      fs.rmSync(dir, {recursive: true, force: true});
    });

    test('navigate refuses local files that are not .html/.htm', async () => {
      const {content, isError} = await callTool(client, 'navigate', {url: notesUrl});
      expect(isError).toBe(true);
      expect((content[0] as TextBlock).text).toContain(
        'Only .html and .htm files can be opened with file:// URLs ("notes.txt" is not one)'
      );
    });

    test('navigate opens a local .html file and read_page works on it', async ({app}) => {
      const nav = await callTool(client, 'navigate', {url: pageUrl});
      expect(nav.isError).toBe(false);
      expect(firstTextJson(nav.content).pageTitle).toBe('Local page');
      await expect(app.addressBar).toHaveValue(/page\.html/);

      const read = await callTool(client, 'read_page');
      expect(read.isError).toBe(false);
      expect(firstTextJson(read.content).text).toContain('Local page');
    });

    test('tools refuse to read a local file reached from a local .html page', async () => {
      const nav = await callTool(client, 'navigate', {url: pageUrl});
      expect(nav.isError).toBe(false);

      const click = await callTool(client, 'click', {selector: '#notes'});
      expect(click.isError).toBe(true);
      expect((click.content[0] as TextBlock).text).toContain("MCP tools can't access");
      expect((click.content[0] as TextBlock).text).not.toContain('top secret');

      const read = await callTool(client, 'read_page');
      expect(read.isError).toBe(true);
      expect((read.content[0] as TextBlock).text).not.toContain('top secret');

      const shot = await callTool(client, 'screenshot');
      expect(shot.content.some((c) => c.type === 'image')).toBe(false);
      expect(shot.content.map((c) => (c as TextBlock).text).join(' ')).toContain('Skipped:');
    });
  });

  test('set_active_devices switches previews by id and name', async ({app}) => {
    const {content, isError} = await callTool(client, 'set_active_devices', {
      devices: ['10008', 'iPad'],
    });
    expect(isError).toBe(false);
    const result = firstTextJson(content);
    expect(result.activeDevices.map((device: {id: string}) => device.id)).toEqual([
      '10008',
      '10013',
    ]);
    await expect(app.webviews).toHaveCount(2);

    // Restore the default suite for subsequent tests.
    const restore = await callTool(client, 'set_active_devices', {devices: DEFAULT_DEVICE_IDS});
    expect(restore.isError).toBe(false);
    await expect(app.webviews).toHaveCount(3);
  });

  test('set_active_devices rejects unknown devices without applying', async ({app}) => {
    const {content, isError} = await callTool(client, 'set_active_devices', {
      devices: ['10008', 'Nokia 3310'],
    });
    expect(isError).toBe(true);
    expect((content[0] as TextBlock).text).toContain('Nokia 3310');
    await expect(app.webviews).toHaveCount(3);
  });

  test('set_device_options changes the primary viewport and theme without editing presets', async ({
    app,
    mainWindow,
    electronApp,
    testServerUrl,
  }) => {
    await callTool(client, 'navigate', {url: `${testServerUrl}/interaction-test.html`});
    const metrics = (name: string) =>
      readPreview<PreviewMetrics>(mainWindow, electronApp, name, PREVIEW_METRICS_SCRIPT);
    const activeDevices = async (): Promise<ActiveDeviceState[]> =>
      firstTextJson((await callTool(client, 'get_app_state')).content).activeDevices;
    const catalogDimensions = async () => {
      const catalog = firstTextJson((await callTool(client, 'list_devices')).content) as Array<{
        id: string;
        width: number;
        height: number;
      }>;
      return catalog.map(({id, width, height}) => ({id, width, height}));
    };
    const baseline = await Promise.all(DEFAULT_DEVICE_NAMES.map(metrics));
    const catalogBefore = await catalogDimensions();
    try {
      const changed = await callTool(client, 'set_device_options', {
        width: 640,
        height: 960,
        orientation: 'landscape',
        colorScheme: 'dark',
      });
      expect(changed.isError).toBe(false);
      expect(firstTextJson(changed.content).viewportApplied).toBe(true);
      expect(firstTextJson(changed.content).device).toMatchObject({
        id: '10008',
        width: 960,
        height: 640,
        orientation: 'landscape',
        colorScheme: 'dark',
      });
      await expect
        .poll(() => metrics('iPhone 12 Pro'))
        .toEqual({
          width: 960,
          height: 640,
          dark: true,
        });
      expect(await Promise.all(DEFAULT_DEVICE_NAMES.slice(1).map(metrics))).toEqual(
        baseline.slice(1)
      );
      await expect(mainWindow.locator('[data-device-label="iPhone 12 Pro"]')).toContainText(
        '960 × 640'
      );
      const shot = await callTool(client, 'screenshot', {device: '10008'});
      expect(shot.isError).toBe(false);
      expect((shot.content[0] as TextBlock).text).toContain('iPhone 12 Pro (960x640)');
      expect(await catalogDimensions()).toEqual(catalogBefore);

      // Partial options retain the custom dimensions. UI rotation must update
      // the same effective geometry the tool reports.
      expect(
        (
          await callTool(client, 'set_device_options', {
            device: '10008',
            orientation: 'portrait',
            colorScheme: 'light',
          })
        ).isError
      ).toBe(false);
      await expect
        .poll(() => metrics('iPhone 12 Pro'))
        .toEqual({
          width: 640,
          height: 960,
          dark: false,
        });
      await app.revealDevicePill();
      await mainWindow.locator('button[title="Rotate this device"]').first().click();
      await expect
        .poll(() => metrics('iPhone 12 Pro'))
        .toEqual({
          width: 960,
          height: 640,
          dark: false,
        });
      expect((await activeDevices())[0]).toMatchObject({
        width: 960,
        height: 640,
        orientation: 'landscape',
        colorScheme: 'light',
      });

      const previousDocument = await readPreview<number>(
        mainWindow,
        electronApp,
        'iPhone 12 Pro',
        'performance.timeOrigin'
      );
      await app.perDeviceRefreshButtons.first().click();
      await expect
        .poll(() =>
          readPreview<number>(mainWindow, electronApp, 'iPhone 12 Pro', 'performance.timeOrigin')
        )
        .not.toBe(previousDocument);
      await expect
        .poll(() => metrics('iPhone 12 Pro'))
        .toEqual({
          width: 960,
          height: 640,
          dark: false,
        });

      // System removes the per-device media override and follows the app theme.
      expect((await callTool(client, 'set_device_options', {colorScheme: 'system'})).isError).toBe(
        false
      );
      const systemDark = await electronApp.evaluate(
        ({nativeTheme}) => nativeTheme.shouldUseDarkColors
      );
      await expect.poll(async () => (await metrics('iPhone 12 Pro')).dark).toBe(systemDark);
      expect((await callTool(client, 'set_device_options', {reset: true})).isError).toBe(false);
      await expect.poll(() => metrics('iPhone 12 Pro')).toEqual(baseline[0]);
      expect(await catalogDimensions()).toEqual(catalogBefore);
    } finally {
      await restoreDeviceControls(client);
    }
  });

  test('set_device_options targets a named preview and rejects invalid changes atomically', async ({
    mainWindow,
    electronApp,
    testServerUrl,
  }) => {
    await callTool(client, 'navigate', {url: `${testServerUrl}/mcp-scroll.html`});
    const metrics = (name: string) =>
      readPreview<PreviewMetrics>(mainWindow, electronApp, name, PREVIEW_METRICS_SCRIPT);
    const primaryBefore = await metrics('iPhone 12 Pro');
    try {
      const changed = await callTool(client, 'set_device_options', {
        device: 'iPad',
        width: 701,
        height: 901,
        orientation: 'portrait',
        colorScheme: 'dark',
      });
      expect(changed.isError).toBe(false);
      expect(firstTextJson(changed.content).device.id).toBe('10013');
      await expect.poll(() => metrics('iPad')).toEqual({width: 701, height: 901, dark: true});
      expect(await metrics('iPhone 12 Pro')).toEqual(primaryBefore);
      const beforeInvalid = firstTextJson((await callTool(client, 'get_app_state')).content);
      for (const args of [
        {},
        {reset: false},
        {device: 'iPad', width: 0, colorScheme: 'light'},
        {device: 'iPad', height: 1.5},
        {device: 'iPad', width: 10001},
        {device: 'Unknown device', width: 500},
        {device: 'iPhone 4', width: 500},
      ]) {
        const result = await callTool(client, 'set_device_options', args);
        expect(result.isError).toBe(true);
      }
      expect(firstTextJson((await callTool(client, 'get_app_state')).content)).toEqual(
        beforeInvalid
      );
      expect(await metrics('iPad')).toEqual({width: 701, height: 901, dark: true});
    } finally {
      await restoreDeviceControls(client);
    }
  });

  test('set_device_options saves a hidden focused-layout preview and applies it when shown', async ({
    app,
    mainWindow,
    electronApp,
    testServerUrl,
  }) => {
    const previousLayout = firstTextJson((await callTool(client, 'get_app_state')).content).layout;
    await mainWindow.getByTestId('layout-FLEX').click();
    await callTool(client, 'navigate', {url: `${testServerUrl}/mcp-scroll.html`});
    try {
      await app.revealDevicePill(1);
      await mainWindow.locator('button[title="Focus this device"]').nth(1).click();
      await expect(mainWindow.locator('webview[id="iPhone 12 Pro"]')).toBeHidden();
      await expect(mainWindow.locator('webview[id="iPad"]')).toBeVisible();
      const changed = await callTool(client, 'set_device_options', {
        width: 650,
        height: 950,
        orientation: 'portrait',
      });
      expect(changed.isError).toBe(false);
      expect(firstTextJson(changed.content).viewportApplied).toBe(false);
      expect(firstTextJson(changed.content).device).toMatchObject({
        id: '10008',
        width: 650,
        height: 950,
      });
      await expect(mainWindow.locator('webview[id="iPhone 12 Pro"]')).toHaveCSS('width', '650px');
      await expect(mainWindow.locator('webview[id="iPhone 12 Pro"]')).toHaveCSS('height', '950px');

      await mainWindow.getByTestId('layout-FLEX').click();
      await expect(mainWindow.locator('webview[id="iPhone 12 Pro"]')).toBeVisible();
      await expect
        .poll(() =>
          readPreview(
            mainWindow,
            electronApp,
            'iPhone 12 Pro',
            '({width:innerWidth,height:innerHeight})'
          )
        )
        .toEqual({width: 650, height: 950});
    } finally {
      await mainWindow.getByTestId(`layout-${previousLayout}`).click();
      await restoreDeviceControls(client);
    }
  });

  test('set_mirroring isolates a preview across reload and stays synchronized with its UI', async ({
    app,
    mainWindow,
    electronApp,
    testServerUrl,
  }) => {
    await callTool(client, 'navigate', {url: `${testServerUrl}/interaction-test.html`});
    const socketStates = () =>
      Promise.all(
        DEFAULT_DEVICE_NAMES.map((name) =>
          readPreview<boolean>(
            mainWindow,
            electronApp,
            name,
            'Boolean(window.___browserSync___?.socket?.connected)'
          )
        )
      );
    const counts = () =>
      Promise.all(
        DEFAULT_DEVICE_NAMES.map((name) =>
          readPreview<number>(
            mainWindow,
            electronApp,
            name,
            'Number(document.querySelector("#count")?.textContent)'
          )
        )
      );
    const mirroringFlags = async () => {
      const state = firstTextJson((await callTool(client, 'get_app_state')).content);
      return (state.activeDevices as ActiveDeviceState[]).map((device) => device.mirroringEnabled);
    };
    try {
      // Omitted device applies to every active preview.
      expect((await callTool(client, 'set_mirroring', {enabled: false})).isError).toBe(false);
      expect(await mirroringFlags()).toEqual([false, false, false]);
      await expect.poll(socketStates).toEqual([false, false, false]);
      expect((await callTool(client, 'set_mirroring', {enabled: true})).isError).toBe(false);
      await expect.poll(socketStates, {timeout: 15_000}).toEqual([true, true, true]);
      await expect.poll(counts).toEqual([0, 0, 0]);

      expect(
        (await callTool(client, 'set_mirroring', {device: 'iPad', enabled: false})).isError
      ).toBe(false);
      expect(await mirroringFlags()).toEqual([true, false, true]);
      await expect.poll(socketStates).toEqual([true, false, true]);
      await app.revealDevicePill(1);
      await app.moreDeviceToolsButtons.nth(1).click();
      await expect(app.eventMirroringButtons).toHaveAttribute('aria-pressed', 'false');
      await mainWindow.keyboard.press('Escape');

      // A disconnected device must neither send nor receive mirrored input.
      expect(
        (await callTool(client, 'click', {device: 'iPad', selector: '#counter-btn'})).isError
      ).toBe(false);
      await expect.poll(counts).toEqual([0, 1, 0]);
      expect((await callTool(client, 'click', {selector: '#counter-btn'})).isError).toBe(false);
      await expect.poll(counts).toEqual([1, 1, 1]);

      const previousDocument = await readPreview<number>(
        mainWindow,
        electronApp,
        'iPad',
        'performance.timeOrigin'
      );
      await app.revealDevicePill(1);
      await app.perDeviceRefreshButtons.nth(1).click();
      await expect
        .poll(() => readPreview<number>(mainWindow, electronApp, 'iPad', 'performance.timeOrigin'))
        .not.toBe(previousDocument);
      await expect.poll(counts).toEqual([1, 0, 1]);
      expect(await mirroringFlags()).toEqual([true, false, true]);
      expect(await socketStates()).toEqual([true, false, true]);
      expect(
        (await callTool(client, 'click', {device: '10013', selector: '#counter-btn'})).isError
      ).toBe(false);
      await expect.poll(counts).toEqual([1, 1, 1]);
      expect((await callTool(client, 'click', {selector: '#counter-btn'})).isError).toBe(false);
      await expect.poll(counts).toEqual([2, 1, 2]);

      // Changing the same setting through the UI must update MCP state too.
      await app.revealDevicePill(1);
      await app.moreDeviceToolsButtons.nth(1).click();
      await expect(app.eventMirroringButtons).toHaveAttribute('aria-pressed', 'false');
      await app.eventMirroringButtons.click();
      await expect.poll(mirroringFlags).toEqual([true, true, true]);
      await expect.poll(socketStates, {timeout: 15_000}).toEqual([true, true, true]);
      expect((await callTool(client, 'click', {selector: '#counter-btn'})).isError).toBe(false);
      await expect.poll(counts).toEqual([3, 2, 3]);
    } finally {
      await mainWindow.keyboard.press('Escape');
      await restoreDeviceControls(client);
    }
  });

  test('set_mirroring accepts ids and rejects unknown or inactive devices without changing state', async () => {
    try {
      expect(
        (await callTool(client, 'set_mirroring', {device: '10013', enabled: false})).isError
      ).toBe(false);
      const before = firstTextJson((await callTool(client, 'get_app_state')).content).activeDevices;
      expect((before as ActiveDeviceState[]).map((device) => device.mirroringEnabled)).toEqual([
        true,
        false,
        true,
      ]);
      for (const device of ['Unknown device', 'iPhone 4']) {
        expect((await callTool(client, 'set_mirroring', {device, enabled: false})).isError).toBe(
          true
        );
      }
      expect(
        firstTextJson((await callTool(client, 'get_app_state')).content).activeDevices
      ).toEqual(before);
    } finally {
      await restoreDeviceControls(client);
    }
  });

  test('set_mirroring isolates link navigation while explicit navigate still reaches every device', async ({
    mainWindow,
    electronApp,
    testServerUrl,
  }) => {
    const interactionUrl = `${testServerUrl}/interaction-test.html`;
    const destinationUrl = `${testServerUrl}/test-page.html`;
    const urls = () =>
      Promise.all(
        DEFAULT_DEVICE_NAMES.map((name) =>
          readPreview<string>(mainWindow, electronApp, name, 'location.href')
        )
      );
    const connected = () =>
      Promise.all(
        DEFAULT_DEVICE_NAMES.map((name) =>
          readPreview<boolean>(
            mainWindow,
            electronApp,
            name,
            'Boolean(window.___browserSync___?.socket?.connected)'
          )
        )
      );
    try {
      expect((await callTool(client, 'set_mirroring', {enabled: true})).isError).toBe(false);
      await callTool(client, 'navigate', {url: interactionUrl});
      await expect.poll(connected, {timeout: 15_000}).toEqual([true, true, true]);
      expect(
        (await callTool(client, 'set_mirroring', {device: '10008', enabled: false})).isError
      ).toBe(false);
      expect((await callTool(client, 'click', {selector: '#home-link'})).isError).toBe(false);
      await expect.poll(urls).toEqual([destinationUrl, interactionUrl, interactionUrl]);

      // Navigation explicitly requested through MCP remains an all-device action.
      expect((await callTool(client, 'navigate', {url: interactionUrl})).isError).toBe(false);
      await expect.poll(urls).toEqual([interactionUrl, interactionUrl, interactionUrl]);
      expect(
        (await callTool(client, 'set_mirroring', {device: '10008', enabled: true})).isError
      ).toBe(false);
      expect(
        (await callTool(client, 'set_mirroring', {device: 'iPad', enabled: false})).isError
      ).toBe(false);
      await expect.poll(connected, {timeout: 15_000}).toEqual([true, false, true]);
      expect((await callTool(client, 'click', {selector: '#home-link'})).isError).toBe(false);
      await expect.poll(urls).toEqual([destinationUrl, interactionUrl, destinationUrl]);
      expect((await callTool(client, 'navigate', {url: interactionUrl})).isError).toBe(false);
      await expect.poll(urls).toEqual([interactionUrl, interactionUrl, interactionUrl]);

      // A secondary isolated preview can diverge while the address bar stays
      // unchanged. Repeating that explicit address must still bring it back.
      expect(
        (await callTool(client, 'click', {device: 'iPad', selector: '#home-link'})).isError
      ).toBe(false);
      await expect.poll(urls).toEqual([interactionUrl, destinationUrl, interactionUrl]);
      expect((await callTool(client, 'navigate', {url: interactionUrl})).isError).toBe(false);
      await expect.poll(urls).toEqual([interactionUrl, interactionUrl, interactionUrl]);
    } finally {
      await restoreDeviceControls(client);
    }
  });

  test('screenshot returns a labeled JPEG per device', async () => {
    const {content, isError} = await callTool(client, 'screenshot');
    expect(isError).toBe(false);
    const images = content.filter((block): block is ImageBlock => block.type === 'image');
    expect(images).toHaveLength(3);
    images.forEach((image) => {
      expect(image.mimeType).toBe('image/jpeg');
      const bytes = Buffer.from(image.data, 'base64');
      // JPEG magic bytes
      expect(bytes[0]).toBe(0xff);
      expect(bytes[1]).toBe(0xd8);
    });
    const labels = content.filter((block): block is TextBlock => block.type === 'text');
    expect(labels.some((label) => label.text.includes('iPhone 12 Pro'))).toBe(true);
  });

  test('screenshot of a single device by name', async () => {
    const {content, isError} = await callTool(client, 'screenshot', {device: 'iPad'});
    expect(isError).toBe(false);
    const images = content.filter((block): block is ImageBlock => block.type === 'image');
    expect(images).toHaveLength(1);
    expect((content[0] as TextBlock).text).toContain('iPad');
  });

  test('screenshot supports full-page and original resolution without moving the page', async ({
    electronApp,
    testServerUrl,
  }) => {
    await callTool(client, 'navigate', {url: `${testServerUrl}/mcp-scroll.html`});
    expect((await callTool(client, 'scroll_to', {device: 'iPad', y: 300})).isError).toBe(false);
    const measure = () =>
      electronApp.evaluate(async ({webContents}) => {
        const preview = webContents
          .getAllWebContents()
          .find(
            (wc) =>
              wc.getType() === 'webview' &&
              wc.getURL().includes('mcp-scroll.html') &&
              wc.getUserAgent().includes('iPad')
          );
        if (!preview) throw new Error('iPad preview not found');
        return preview.executeJavaScript(`({
        width: innerWidth, height: innerHeight,
        pageHeight: document.documentElement.scrollHeight,
        scrollY, dpr: devicePixelRatio
      })`);
      });
    const before = await measure();
    expect(before.scrollY).toBeCloseTo(300, 0);
    const dimensions: Array<{width: number; height: number}> = [];
    for (const options of [
      {},
      {originalResolution: true},
      {fullPage: true},
      {fullPage: true, originalResolution: true},
    ]) {
      const {content, isError} = await callTool(client, 'screenshot', {device: 'iPad', ...options});
      expect(isError).toBe(false);
      const images = content.filter((block): block is ImageBlock => block.type === 'image');
      expect(images).toHaveLength(1);
      expect(images[0].mimeType).toBe(options.originalResolution ? 'image/png' : 'image/jpeg');
      dimensions.push(
        await electronApp.evaluate(
          ({nativeImage}, data) =>
            nativeImage.createFromBuffer(Buffer.from(data, 'base64')).getSize(),
          images[0].data
        )
      );
    }
    expect(dimensions[0].width).toBeLessThanOrEqual(1000);
    expect(dimensions[1].width).toBeGreaterThanOrEqual(dimensions[0].width);
    expect(dimensions[2].width).toBeLessThanOrEqual(1000);
    expect(dimensions[2].height / dimensions[2].width).toBeCloseTo(
      before.pageHeight / before.width,
      1
    );
    expect(dimensions[3].height).toBeGreaterThan(dimensions[1].height);
    expect(dimensions[3].width).toBeGreaterThanOrEqual(dimensions[2].width);
    const after = await measure();
    expect(after).toEqual(before);
  });

  test('original resolution preserves native pixels on a wide desktop', async ({
    electronApp,
    testServerUrl,
  }) => {
    await callTool(client, 'navigate', {url: `${testServerUrl}/mcp-scroll.html`});
    const nativeSize = await electronApp.evaluate(async ({webContents, nativeImage}) => {
      const preview = webContents
        .getAllWebContents()
        .find((wc) => wc.getType() === 'webview' && wc.getUserAgent().includes('Macintosh'));
      if (!preview) throw new Error('Desktop preview not found');
      const captured = await preview.capturePage();
      const scaleFactor = Math.max(...captured.getScaleFactors());
      return nativeImage.createFromBuffer(captured.toPNG({scaleFactor})).getSize();
    });
    expect(nativeSize.width).toBeGreaterThan(1000);
    const {content, isError} = await callTool(client, 'screenshot', {
      device: 'MacBook Pro',
      originalResolution: true,
    });
    expect(isError).toBe(false);
    const image = content.find((block): block is ImageBlock => block.type === 'image');
    expect(image).toBeDefined();
    const size = await electronApp.evaluate(
      ({nativeImage}, data) => nativeImage.createFromBuffer(Buffer.from(data, 'base64')).getSize(),
      image!.data
    );
    expect(size).toEqual(nativeSize);
  });

  test('full-page capture preserves an active element inspector', async ({
    electronApp,
    mainWindow,
    testServerUrl,
  }) => {
    await callTool(client, 'navigate', {url: `${testServerUrl}/mcp-scroll.html`});
    const inspectButton = mainWindow.locator('button[title="Inspect Elements"]');
    const attached = () =>
      electronApp.evaluate(
        ({webContents}) =>
          webContents
            .getAllWebContents()
            .find((wc) => wc.getType() === 'webview' && wc.getUserAgent().includes('iPad'))
            ?.debugger.isAttached() ?? false
      );
    await inspectButton.click();
    try {
      await expect.poll(attached).toBe(true);
      const result = await callTool(client, 'screenshot', {device: 'iPad', fullPage: true});
      expect(result.isError).toBe(false);
      expect(await attached()).toBe(true);
    } finally {
      await inspectButton.click();
    }
    await expect.poll(attached).toBe(false);
  });

  test('scroll_to finds selectors, normalized text, and nested containers', async ({
    electronApp,
    testServerUrl,
  }) => {
    await callTool(client, 'navigate', {url: `${testServerUrl}/mcp-scroll.html`});
    for (const target of [
      {selector: '#footer'},
      {text: '  PRICING   plans  ', exact: true},
      {selector: '#nested-target'},
    ]) {
      const {content, isError} = await callTool(client, 'scroll_to', {device: 'iPad', ...target});
      expect(isError).toBe(false);
      const result = firstTextJson(content);
      expect(result.deviceName).toBe('iPad');
      expect(result.matchedElement.selector).toBe(target.selector ?? '#pricing');
      expect(result.matchedElement.rect.y).toBeGreaterThanOrEqual(0);
      expect(result.matchedElement.rect.y).toBeLessThan(result.viewport.height);
      expect(result.scroll.y).toBeGreaterThan(0);
    }
    const nestedState = await electronApp.evaluate(async ({webContents}) => {
      const preview = webContents
        .getAllWebContents()
        .find(
          (wc) =>
            wc.getType() === 'webview' &&
            wc.getURL().includes('mcp-scroll.html') &&
            wc.getUserAgent().includes('iPad')
        );
      if (!preview) throw new Error('iPad preview not found');
      return preview.executeJavaScript(`({
        scrollTop: document.querySelector('#nested').scrollTop,
        top: document.querySelector('#nested-target').getBoundingClientRect().top,
        height: innerHeight
      })`);
    });
    expect(nestedState.scrollTop).toBeGreaterThan(0);
    expect(nestedState.top).toBeGreaterThanOrEqual(0);
    expect(nestedState.top).toBeLessThan(nestedState.height);
    const reset = await callTool(client, 'scroll_to', {x: 0, y: 0});
    expect(reset.isError).toBe(false);
    expect(firstTextJson(reset.content).deviceName).toBe('iPhone 12 Pro');
    expect(firstTextJson(reset.content).scroll.x).toBe(0);
    // Mirrored device coordinates can round to a fractional CSS pixel.
    expect(firstTextJson(reset.content).scroll.y).toBeLessThanOrEqual(1);
  });

  test('scroll_to rejects missing, conflicting, ambiguous, and hidden targets', async ({
    testServerUrl,
  }) => {
    await callTool(client, 'navigate', {url: `${testServerUrl}/mcp-scroll.html`});
    for (const args of [
      {},
      {selector: '#footer', text: 'Footer'},
      {selector: '#footer', y: 0},
      {text: 'Repeated label'},
      {text: 'Hidden target'},
      {selector: '#missing'},
      {selector: '['},
      {y: -1},
      {y: 0, device: 'Unknown device'},
    ]) {
      const result = await callTool(client, 'scroll_to', args);
      expect(result.isError).toBe(true);
      expect((result.content[0] as TextBlock).text.length).toBeGreaterThan(0);
    }
  });

  test('read_page lists interactive elements with selectors', async ({testServerUrl}) => {
    await callTool(client, 'navigate', {url: `${testServerUrl}/interaction-test.html`});
    const {content, isError} = await callTool(client, 'read_page');
    expect(isError).toBe(false);
    const page = firstTextJson(content);
    expect(page.title).toBe('Interaction Test');
    expect(page.text).toContain('Count: 0');
    const button = page.elements.find((el: {selector: string}) => el.selector === '#counter-btn');
    expect(button.text).toBe('Increment');
    const input = page.elements.find((el: {selector: string}) => el.selector === '#name-input');
    expect(input.inputType).toBe('text');
    const link = page.elements.find((el: {selector: string}) => el.selector === '#home-link');
    expect(link.href).toContain('test-page.html');
  });

  test('click triggers a real mouse click on the element', async ({testServerUrl}) => {
    await callTool(client, 'navigate', {url: `${testServerUrl}/interaction-test.html`});
    const {content, isError} = await callTool(client, 'click', {selector: '#counter-btn'});
    expect(isError).toBe(false);
    const result = firstTextJson(content);
    expect(result.clicked.text).toBe('Increment');
    // Input-event delivery can lag under full-suite CPU load — poll the page
    // instead of asserting a single read.
    await expect
      .poll(async () => firstTextJson((await callTool(client, 'read_page')).content).text, {
        timeout: 10_000,
      })
      .toContain('Count: 1');
  });

  test('click errors clearly for unknown selectors', async ({testServerUrl}) => {
    await callTool(client, 'navigate', {url: `${testServerUrl}/interaction-test.html`});
    const {content, isError} = await callTool(client, 'click', {selector: '#no-such-element'});
    expect(isError).toBe(true);
    expect((content[0] as TextBlock).text).toContain('No element matches');
  });

  test('type_text fills a field and Enter submits the form', async ({testServerUrl}) => {
    await callTool(client, 'navigate', {url: `${testServerUrl}/interaction-test.html`});
    const {content, isError} = await callTool(client, 'type_text', {
      selector: '#name-input',
      text: 'Claude',
      pressEnter: true,
    });
    expect(isError).toBe(false);
    const result = firstTextJson(content);
    expect(result.value).toBe('Claude');
    const after = firstTextJson((await callTool(client, 'read_page')).content);
    expect(after.text).toContain('Hello Claude');
  });

  test('interaction tools accept a specific device', async ({testServerUrl}) => {
    await callTool(client, 'navigate', {url: `${testServerUrl}/interaction-test.html`});
    const {content, isError} = await callTool(client, 'read_page', {device: 'iPad'});
    expect(isError).toBe(false);
    expect(firstTextJson(content).deviceName).toBe('iPad');
  });

  test('rejects requests with a non-loopback Host header', async ({mcpPort}) => {
    const status = await new Promise<number>((resolve, reject) => {
      const req = http.request(
        {
          host: '127.0.0.1',
          port: mcpPort,
          path: '/mcp',
          method: 'POST',
          headers: {Host: 'evil.com', 'Content-Type': 'application/json'},
        },
        (res) => resolve(res.statusCode ?? 0)
      );
      req.on('error', reject);
      req.end('{}');
    });
    expect(status).toBe(403);
  });

  test('rejects unknown paths and bare GETs', async ({mcpPort}) => {
    const notFound = await fetch(`http://127.0.0.1:${mcpPort}/other`, {method: 'POST'});
    expect(notFound.status).toBe(404);
    // GET without Accept: text/event-stream is rejected by the MCP transport.
    const badGet = await fetch(`http://127.0.0.1:${mcpPort}/mcp`);
    expect(badGet.status).toBe(406);
  });
});
