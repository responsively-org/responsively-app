/**
 * Generates the MCP tool manifest shipped next to the bridge (resources/mcp/
 * manifest.json). Registers the real tool definitions on a throwaway server
 * with no-op handlers and reads tools/list back through the SDK itself, so
 * the manifest is byte-identical to what the live app emits.
 *
 * Runs under plain Node via tsx — no Electron.
 */
import fs from 'fs';
import path from 'path';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {MCP_SERVER_NAME} from '../../src/common/mcp';
import {toolDefs} from '../../src/main/mcp/toolDefs';
import webpackPaths from '../configs/webpack.paths';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {version} = require('../../release/app/package.json');

const main = async () => {
  const server = new McpServer({name: MCP_SERVER_NAME, version});
  Object.entries(toolDefs).forEach(([name, def]) => {
    server.registerTool(name, def as never, async () => ({content: []}));
  });

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({name: 'manifest-generator', version: '0.0.0'});
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  const {tools} = await client.listTools();

  const outDir = path.join(webpackPaths.distPath, 'mcp');
  fs.mkdirSync(outDir, {recursive: true});
  const outFile = path.join(outDir, 'manifest.json');
  fs.writeFileSync(outFile, JSON.stringify({name: MCP_SERVER_NAME, version, tools}, null, 2));
  // eslint-disable-next-line no-console
  console.log(`Wrote ${tools.length} tools to ${outFile}`);

  await client.close();
  await server.close();
};

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
