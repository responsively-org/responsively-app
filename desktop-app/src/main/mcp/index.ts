import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {app} from 'electron';
import http from 'http';
import store from '../../store';
import log from '../logging';
import {MCP_SERVER_NAME} from '../../common/mcp';
import {writeMcpBeacon} from './beacon';
import {GetMainWindow, initMcpBridge} from './bridge';
import {registerTools} from './tools';
import {isAllowedHostHeader, resolveMcpPort} from './utils';

let httpServer: http.Server | null = null;
let activePort: number | null = null;
let lastError: string | null = null;
let getMainWindowRef: GetMainWindow | null = null;

export interface McpServerStatus {
  enabled: boolean;
  running: boolean;
  port: number;
  endpoint: string;
  error: string | null;
}

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

const startServer = (getMainWindow: GetMainWindow): void => {
  if (httpServer !== null) {
    return;
  }
  const port = resolveMcpPort();
  lastError = null;

  const server = http.createServer(async (req, res) => {
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
      log.error('[mcp] Error handling request:', error);
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

  server.on('error', (error: NodeJS.ErrnoException) => {
    // EADDRINUSE (e.g. a second app instance): the app must keep working
    // without MCP rather than crash.

    log.warn(
      `[mcp] MCP server not started on port ${port} (${error.code ?? error.message}). ` +
        'Another Responsively App instance may already be running.'
    );
    lastError = error.code ?? error.message;
    httpServer = null;
    activePort = null;
  });

  server.listen(port, '127.0.0.1', () => {
    activePort = port;
    // The beacon is how the npm bootstrap finds a running app, so it must
    // only exist while the server is actually listening.
    writeMcpBeacon(port);
    log.info(`[mcp] MCP server listening on http://127.0.0.1:${port}/mcp`);
  });

  httpServer = server;
};

const stopServer = (): void => {
  httpServer?.close();
  httpServer = null;
  activePort = null;
};

export const getMcpServerStatus = (): McpServerStatus => {
  const port = activePort ?? resolveMcpPort();
  return {
    enabled: store.get('userPreferences.mcpEnabled') !== false,
    running: httpServer !== null && activePort !== null,
    port,
    endpoint: `http://127.0.0.1:${port}/mcp`,
    error: lastError,
  };
};

/** Turns the server on or off and remembers the choice across launches. */
export const setMcpServerEnabled = (enabled: boolean): McpServerStatus => {
  store.set('userPreferences.mcpEnabled', enabled);
  if (enabled) {
    if (getMainWindowRef !== null) {
      startServer(getMainWindowRef);
    }
  } else {
    stopServer();
  }
  return getMcpServerStatus();
};

export const initMcpServer = (getMainWindow: GetMainWindow) => {
  initMcpBridge();
  getMainWindowRef = getMainWindow;

  if (store.get('userPreferences.mcpEnabled') !== false) {
    startServer(getMainWindow);
  } else {
    log.info('[mcp] MCP server disabled by user preference');
  }

  app.on('will-quit', () => {
    stopServer();
  });
};
