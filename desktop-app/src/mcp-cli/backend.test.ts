// @vitest-environment node
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import http from 'http';
import {z} from 'zod';
import {afterEach, describe, expect, it} from 'vitest';
import {createBackend} from './backend';

interface FakeApp {
  port: number;
  close: () => Promise<void>;
}

const running: FakeApp[] = [];

const startFakeApp = async (name = 'responsively', port = 0): Promise<FakeApp> => {
  const httpServer = http.createServer(async (req, res) => {
    const server = new McpServer({name, version: '0.0.1-test'});
    server.registerTool(
      'echo',
      {description: 'echo', inputSchema: {value: z.string()}},
      async ({value}) => ({content: [{type: 'text', text: value}]})
    );
    server.registerTool('picture', {description: 'img'}, async () => ({
      content: [{type: 'image', data: 'aGk=', mimeType: 'image/jpeg'}],
    }));
    server.registerTool('broken', {description: 'always errors'}, async () => ({
      content: [{type: 'text', text: 'boom'}],
      isError: true,
    }));
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
  });
  await new Promise<void>((resolve) => {
    httpServer.listen(port, '127.0.0.1', () => resolve());
  });
  const app: FakeApp = {
    port: (httpServer.address() as {port: number}).port,
    close: () =>
      new Promise((resolve) => {
        httpServer.close(() => resolve());
        httpServer.closeAllConnections();
      }),
  };
  running.push(app);
  return app;
};

const freePort = async (): Promise<number> => {
  const probe = http.createServer();
  await new Promise<void>((resolve) => {
    probe.listen(0, '127.0.0.1', () => resolve());
  });
  const {port} = probe.address() as {port: number};
  await new Promise((resolve) => {
    probe.close(resolve);
  });
  return port;
};

afterEach(async () => {
  await Promise.all(running.splice(0).map((app) => app.close()));
});

describe('mcp-cli backend', () => {
  it('finds a running Responsively backend', async () => {
    const app = await startFakeApp();
    const backend = createBackend({port: app.port});
    const client = await backend.getIfRunning();
    expect(client).not.toBeNull();
    await backend.invalidate();
  });

  it('returns null when nothing is listening', async () => {
    const backend = createBackend({port: await freePort(), probeTimeoutMs: 500});
    expect(await backend.getIfRunning()).toBeNull();
  });

  it('rejects MCP servers that are not Responsively', async () => {
    const app = await startFakeApp('someone-else');
    const backend = createBackend({port: app.port});
    expect(await backend.getIfRunning()).toBeNull();
  });

  it('passes tool calls and results through verbatim', async () => {
    const app = await startFakeApp();
    const backend = createBackend({port: app.port});
    const echoed = await backend.callTool({name: 'echo', arguments: {value: 'hello'}});
    expect(echoed.content).toEqual([{type: 'text', text: 'hello'}]);
    const picture = await backend.callTool({name: 'picture', arguments: {}});
    expect(picture.content).toEqual([{type: 'image', data: 'aGk=', mimeType: 'image/jpeg'}]);
    const broken = await backend.callTool({name: 'broken', arguments: {}});
    expect(broken.isError).toBe(true);
    await backend.invalidate();
  });

  it('launches the app when down and polls until reachable', async () => {
    const port = await freePort();
    let launched = false;
    const backend = createBackend({
      port,
      probeTimeoutMs: 500,
      launchTimeoutMs: 5_000,
      pollIntervalMs: 50,
      launcher: async () => {
        launched = true;
        setTimeout(() => {
          startFakeApp('responsively', port);
        }, 300);
      },
    });
    const result = await backend.callTool({name: 'echo', arguments: {value: 'cold-start'}});
    expect(launched).toBe(true);
    expect(result.content).toEqual([{type: 'text', text: 'cold-start'}]);
    await backend.invalidate();
  });

  it('reports an actionable error when the app never comes up', async () => {
    const backend = createBackend({
      port: await freePort(),
      probeTimeoutMs: 200,
      launchTimeoutMs: 400,
      pollIntervalMs: 100,
      launcher: async () => {},
    });
    await expect(backend.callTool({name: 'echo', arguments: {value: 'x'}})).rejects.toThrow(
      /did not become reachable/
    );
  });

  it('reconnects and retries once when the app quits between calls', async () => {
    const first = await startFakeApp();
    let relaunches = 0;
    const backend = createBackend({
      port: first.port,
      probeTimeoutMs: 500,
      launchTimeoutMs: 5_000,
      pollIntervalMs: 50,
      launcher: async () => {
        relaunches += 1;
        // "Relaunch" = a new fake app on the same port.
        await startFakeApp('responsively', first.port);
      },
    });
    await backend.callTool({name: 'echo', arguments: {value: 'one'}});
    await first.close();
    const result = await backend.callTool({name: 'echo', arguments: {value: 'two'}});
    expect(relaunches).toBe(1);
    expect(result.content).toEqual([{type: 'text', text: 'two'}]);
    await backend.invalidate();
  });

  it('relays unknown-tool errors from the backend without retry', async () => {
    const app = await startFakeApp();
    const backend = createBackend({port: app.port});
    const result = await backend.callTool({name: 'nope', arguments: {}});
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain('nope');
    await backend.invalidate();
  });
});
