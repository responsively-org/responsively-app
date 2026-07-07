import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import http from 'http';
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
  });

  test.afterAll(async () => {
    await client?.close();
  });

  test('lists the five tools', async () => {
    const {tools} = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'get_app_state',
      'list_devices',
      'navigate',
      'screenshot',
      'set_active_devices',
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
      // eslint-disable-next-line no-script-url
      url: 'javascript:alert(1)',
    });
    expect(isError).toBe(true);
    expect((content[0] as TextBlock).text).toContain('Unsupported URL scheme');
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
