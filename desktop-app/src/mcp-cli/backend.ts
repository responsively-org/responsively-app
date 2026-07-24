import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {CallToolResultSchema, ErrorCode, McpError} from '@modelcontextprotocol/sdk/types.js';
import {MCP_SERVER_NAME} from '../common/mcp';
import {launchApp} from './launch';
import {log} from './log';

export interface BackendOptions {
  port: number;
  probeTimeoutMs?: number;
  launchTimeoutMs?: number;
  pollIntervalMs?: number;
  launcher?: (port: number) => Promise<void>;
}

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const withTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

const isTransportError = (error: unknown): boolean => {
  if (error instanceof McpError && error.code === ErrorCode.ConnectionClosed) {
    return true;
  }
  const message = error instanceof Error ? error.message : String(error);
  return /fetch failed|ECONNREFUSED|ECONNRESET|socket hang up|network error/i.test(message);
};

export const createBackend = (options: BackendOptions) => {
  const {
    port,
    probeTimeoutMs = 3_000,
    launchTimeoutMs = 60_000,
    pollIntervalMs = 500,
    launcher = launchApp,
  } = options;

  let cached: Client | null = null;
  let launching: Promise<Client> | null = null;

  // One MCP initialize round-trip; the transport itself sends the required
  // `Accept: application/json, text/event-stream` headers on every POST.
  const connectOnce = async (): Promise<Client | null> => {
    const client = new Client({name: 'responsively-mcp-bridge', version: '0.0.0'});
    const transport = new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`));
    try {
      await withTimeout(client.connect(transport), probeTimeoutMs);
      if (client.getServerVersion()?.name !== MCP_SERVER_NAME) {
        log(`port ${port} answered MCP but is not Responsively App — ignoring it`);
        await client.close();
        return null;
      }
      return client;
    } catch {
      await client.close().catch(() => {});
      return null;
    }
  };

  const getIfRunning = async (): Promise<Client | null> => {
    if (cached !== null) {
      return cached;
    }
    cached = await connectOnce();
    return cached;
  };

  const ensure = async (): Promise<Client> => {
    const running = await getIfRunning();
    if (running !== null) {
      return running;
    }
    if (launching === null) {
      launching = (async () => {
        log(`Responsively App is not running — launching it (port ${port})`);
        await launcher(port);
        const deadline = Date.now() + launchTimeoutMs;
        while (Date.now() < deadline) {
          // eslint-disable-next-line no-await-in-loop
          const client = await connectOnce();
          if (client !== null) {
            cached = client;
            return client;
          }
          // eslint-disable-next-line no-await-in-loop
          await sleep(pollIntervalMs);
        }
        throw new Error(
          `Launched Responsively App but 127.0.0.1:${port}/mcp did not become reachable within ` +
            `${Math.round(
              launchTimeoutMs / 1000
            )}s. Another instance may already be running on a ` +
            'different port (set RESPONSIVELY_MCP_PORT to match it), or the app may still be ' +
            'starting — retry the tool call.'
        );
      })().finally(() => {
        launching = null;
      });
    }
    return launching;
  };

  const invalidate = async (): Promise<void> => {
    const stale = cached;
    cached = null;
    await stale?.close().catch(() => {});
  };

  const callTool = async (params: unknown) => {
    const attempt = async () =>
      (await ensure()).request({method: 'tools/call', params} as never, CallToolResultSchema);
    try {
      return await attempt();
    } catch (error) {
      if (!isTransportError(error)) {
        // A real backend answer (e.g. unknown tool) — pass through.
        throw error;
      }
      // The app quit mid-session: probe/launch again and retry once.
      await invalidate();
      return attempt();
    }
  };

  return {getIfRunning, ensure, invalidate, callTool};
};

export type Backend = ReturnType<typeof createBackend>;
