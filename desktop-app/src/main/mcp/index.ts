import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {app} from 'electron';
import http from 'http';
import {MCP_SERVER_NAME} from '../../common/mcp';
import {writeMcpBeacon} from './beacon';
import {GetMainWindow, initMcpBridge} from './bridge';
import {registerTools} from './tools';
import {isAllowedHostHeader, resolveMcpPort} from './utils';

let httpServer: http.Server | null = null;

const handleMcpRequest = async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  getMainWindow: GetMainWindow
) => {
  // Stateless mode: a fresh server + transport per request, so concurrent
  // agents need no session bookkeeping.
  const server = new McpServer({name: MCP_SERVER_NAME, version: app.getVersion()});
  registerTools(server, getMainWindow);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  res.on('close', () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res);
};

export const initMcpServer = (getMainWindow: GetMainWindow) => {
  initMcpBridge();
  const port = resolveMcpPort();
  writeMcpBeacon(port);

  httpServer = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
      if (url.pathname !== '/mcp') {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Not found — the MCP endpoint is /mcp'}));
        return;
      }
      // Reject non-loopback Host headers to block DNS-rebinding attacks.
      if (!isAllowedHostHeader(req.headers.host, port)) {
        res.writeHead(403, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Forbidden'}));
        return;
      }
      await handleMcpRequest(req, res, getMainWindow);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[mcp] Error handling request:', error);
      if (!res.headersSent) {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {code: -32603, message: 'Internal server error'},
            id: null,
          })
        );
      }
    }
  });

  httpServer.on('error', (error: NodeJS.ErrnoException) => {
    // EADDRINUSE (e.g. a second app instance): the app must keep working
    // without MCP rather than crash.
    // eslint-disable-next-line no-console
    console.warn(
      `[mcp] MCP server not started on port ${port} (${error.code ?? error.message}). ` +
        'Another Responsively App instance may already be running.'
    );
    httpServer = null;
  });

  httpServer.listen(port, '127.0.0.1', () => {
    // eslint-disable-next-line no-console
    console.log(`[mcp] MCP server listening on http://127.0.0.1:${port}/mcp`);
  });

  app.on('will-quit', () => {
    httpServer?.close();
    httpServer = null;
  });
};
