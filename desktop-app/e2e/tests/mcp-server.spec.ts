import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import {pathToFileURL} from 'url';
import {expect, test} from '../fixtures/electron-app';

const DEFAULT_DEVICE_IDS = ['10008', '10013', '10015'];

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
    await client?.close();
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
      'set_active_devices',
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
