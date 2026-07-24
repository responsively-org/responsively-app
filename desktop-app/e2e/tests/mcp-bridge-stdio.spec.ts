import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import {expect, test} from '../fixtures/electron-app';

const CLI_PATH = path.join(__dirname, '..', '..', 'release', 'app', 'dist', 'mcp', 'cli.js');

const EXPECTED_TOOLS = [
  'click',
  'get_app_state',
  'list_devices',
  'navigate',
  'read_page',
  'screenshot',
  'set_active_devices',
  'type_text',
];

// Full stdio round-trip: agent → bridge cli.js (plain Node child process) →
// the running app's HTTP MCP server. This is the path npx users exercise.
test.describe('MCP stdio bridge', () => {
  let client: Client;

  test.beforeAll(async ({mainWindow, mcpPort}) => {
    await mainWindow.waitForSelector('webview');
    client = new Client({name: 'bridge-e2e', version: '1.0.0'});
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [CLI_PATH],
      env: {
        ...(process.env as Record<string, string>),
        RESPONSIVELY_MCP_PORT: String(mcpPort),
      },
      stderr: 'pipe',
    });
    await client.connect(transport);
  });

  test.afterAll(async () => {
    await client?.close();
  });

  test('proxies tools/list from the running app', async () => {
    const {tools} = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual(EXPECTED_TOOLS);
  });

  test('proxies tool calls end-to-end', async () => {
    const result = await client.callTool({name: 'get_app_state', arguments: {}});
    expect(result.isError ?? false).toBe(false);
    const content = result.content as Array<{type: string; text?: string}>;
    expect(content[0].type).toBe('text');
    const state = JSON.parse(content[0].text as string);
    expect(Array.isArray(state.activeDevices)).toBe(true);
  });

  test('relays unknown-tool errors', async () => {
    const result = await client.callTool({name: 'does_not_exist', arguments: {}});
    expect(result.isError).toBe(true);
  });
});
