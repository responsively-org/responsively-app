import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import {MCP_SERVER_NAME} from '../common/mcp';
import {createBackend} from './backend';
import {readBeacon, resolveTargetPort} from './beacon';
import {log} from './log';
import {loadManifest} from './manifest';

export const startBridge = async () => {
  const manifest = loadManifest();
  const port = resolveTargetPort(process.env, readBeacon());
  const backend = createBackend({port});

  const server = new Server(
    {name: MCP_SERVER_NAME, version: manifest.version},
    {capabilities: {tools: {}}}
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    // Lazy by design: listing tools must never launch the app. Serve the
    // build-time manifest until the app is up, then proxy the live list.
    const client = await backend.getIfRunning();
    if (client !== null) {
      return client.listTools();
    }
    return {tools: manifest.tools};
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      return await backend.callTool(request.params);
    } catch (error) {
      if (error instanceof McpError) {
        // Backend protocol error (e.g. unknown tool) — relay verbatim.
        throw error;
      }
      // Launch/timeout failures: model-visible, actionable text.
      return {
        content: [{type: 'text', text: error instanceof Error ? error.message : String(error)}],
        isError: true,
      };
    }
  });

  await server.connect(new StdioServerTransport());
  log(`bridge ready (app port ${port}, manifest v${manifest.version})`);
};
