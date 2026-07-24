import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import fs from 'fs';
import path from 'path';
import {expect, test} from '../fixtures/electron-app';

const MANIFEST_PATH = path.join(
  __dirname,
  '..',
  '..',
  'release',
  'app',
  'dist',
  'mcp',
  'manifest.json'
);

interface ToolEntry {
  name: string;
  description?: string;
  inputSchema: unknown;
}

const byName = (a: ToolEntry, b: ToolEntry) => a.name.localeCompare(b.name);

// Drift guard: the manifest bundled with the bridge answers tools/list while
// the app is closed — it must be identical to what the live server emits.
test('bundled MCP manifest matches the live tools/list', async ({mainWindow, mcpPort}) => {
  await mainWindow.waitForSelector('webview');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  const client = new Client({name: 'manifest-drift-check', version: '1.0.0'});
  await client.connect(
    new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${mcpPort}/mcp`))
  );
  const {tools: liveTools} = await client.listTools();
  await client.close();

  const live = (liveTools as ToolEntry[])
    .map(({name, description, inputSchema}) => ({name, description, inputSchema}))
    .sort(byName);
  const bundled = (manifest.tools as ToolEntry[])
    .map(({name, description, inputSchema}) => ({name, description, inputSchema}))
    .sort(byName);

  expect(live).toEqual(bundled);
});
