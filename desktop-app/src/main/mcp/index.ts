import {BrowserWindow, webContents} from 'electron';
import http from 'http';
import path from 'path';
import {ensureDir, writeFile} from 'fs-extra';
import {v4 as uuidv4} from 'uuid';
import store from '../../store';

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const TOOLS: MCPToolDefinition[] = [
  {
    name: 'responsively_list_devices',
    description: 'List all active responsive device views currently loaded in Responsively App.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'responsively_take_screenshot',
    description:
      'Take screenshots of all active responsive devices in Responsively App. ' +
      'Supports two modes: viewport-only (default) captures what is currently visible, ' +
      'and full-page captures the entire scrollable page. ' +
      'Screenshots are named after each device.',
    inputSchema: {
      type: 'object',
      properties: {
        fullPage: {
          type: 'boolean',
          description:
            'If true, captures the full scrollable page for each device. ' +
            'If false or omitted, captures only the visible viewport.',
        },
        saveToFile: {
          type: 'boolean',
          description:
            'Whether to save the screenshots to disk in addition to returning image data.',
        },
      },
    },
  },
  {
    name: 'responsively_navigate',
    description: 'Navigate active responsive views to a specified URL.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL to navigate to (e.g., https://example.com).',
        },
      },
      required: ['url'],
    },
  },
];

interface WebviewDeviceInfo {
  webContentsId: number;
  deviceName: string;
}

export class MCPServer {
  private server: http.Server | null = null;
  private mainWindow: BrowserWindow | null = null;
  private port: number;
  private sseSessions: Map<string, http.ServerResponse> = new Map();

  constructor(port = 9444) {
    this.port = port;
  }

  public setMainWindow(window: BrowserWindow | null) {
    this.mainWindow = window;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Query the renderer process to get the mapping of webContentsId → device name.
   * Each <webview> element's DOM `id` attribute is set to the device name by the
   * Previewer/Device component.
   */
  private async getWebviewDeviceMapping(): Promise<WebviewDeviceInfo[]> {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      return [];
    }

    try {
      const mapping: WebviewDeviceInfo[] = await this.mainWindow.webContents.executeJavaScript(`
        (function() {
          const webviews = document.querySelectorAll('webview');
          return Array.from(webviews).map(wv => ({
            webContentsId: wv.getWebContentsId(),
            deviceName: wv.id || 'unknown-device',
          }));
        })();
      `);
      return mapping;
    } catch {
      return [];
    }
  }

  /**
   * Sanitize a device name for use in filenames (replace slashes, colons, spaces).
   */
  private sanitizeForFilename(name: string): string {
    return name.replace(/[/:]/g, '-').replace(/\s+/g, '_');
  }

  // ─── Tool Handlers ────────────────────────────────────────────────────────

  private async listDevices(_args: Record<string, any>) {
    const deviceMapping = await this.getWebviewDeviceMapping();
    const allWebContents = webContents.getAllWebContents();

    const devices = allWebContents
      .filter((wc) => wc.getType() === 'webview')
      .map((wc) => {
        const mapping = deviceMapping.find((m) => m.webContentsId === wc.id);
        return {
          id: wc.id,
          name: mapping?.deviceName || `webview-${wc.id}`,
          url: wc.getURL(),
          title: wc.getTitle(),
        };
      });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({count: devices.length, devices}, null, 2),
        },
      ],
    };
  }

  private async takeScreenshot(args: Record<string, any>) {
    const allWebContents = webContents.getAllWebContents();
    const webviews = allWebContents.filter((wc) => wc.getType() === 'webview');

    if (webviews.length === 0) {
      return {
        content: [{type: 'text', text: 'No active responsive device viewports found.'}],
      };
    }

    const deviceMapping = await this.getWebviewDeviceMapping();
    const isFullPage = args.fullPage === true;
    const content: Array<any> = [];

    // For full-page screenshots, resize webviews via the renderer, wait, then capture
    if (isFullPage && this.mainWindow && !this.mainWindow.isDestroyed()) {
      try {
        // Ask the renderer to expand all webviews to their full page height
        await this.mainWindow.webContents.executeJavaScript(`
          (async function() {
            const webviews = document.querySelectorAll('webview');
            const savedStyles = [];
            for (const wv of webviews) {
              const pageHeight = await wv.executeJavaScript('document.body.scrollHeight');
              savedStyles.push({
                id: wv.id,
                webContentsId: wv.getWebContentsId(),
                previousHeight: wv.style.height,
                previousTransform: wv.style.transform,
              });
              wv.style.height = pageHeight + 'px';
              wv.style.transform = 'scale(0.1)';
            }
            window.__mcpSavedWebviewStyles = savedStyles;
          })();
        `);

        // Wait for re-render
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (err: any) {
        console.error('[MCP Server] Error preparing full-page capture:', err);
      }
    }

    // Capture each webview
    for (const wc of webviews) {
      const mapping = deviceMapping.find((m) => m.webContentsId === wc.id);
      const deviceName = mapping?.deviceName || `webview-${wc.id}`;

      const image = await wc.capturePage();
      const jpegBuffer = image.toJPEG(90);
      const base64Data = jpegBuffer.toString('base64');
      const safeDeviceName = this.sanitizeForFilename(deviceName);
      const screenshotType = isFullPage ? 'fullpage' : 'viewport';

      let savedFilePath: string | undefined;
      if (args.saveToFile) {
        const dir = store.get('userPreferences.screenshot.saveLocation');
        await ensureDir(dir);
        savedFilePath = path.join(dir, `${safeDeviceName}-${screenshotType}-${Date.now()}.jpeg`);
        await writeFile(savedFilePath, jpegBuffer);
      }

      content.push({
        type: 'image',
        data: base64Data,
        mimeType: 'image/jpeg',
      });
      content.push({
        type: 'text',
        text: `Device: ${deviceName} | Type: ${screenshotType} | URL: ${wc.getURL()}${
          savedFilePath ? ` | Saved: ${savedFilePath}` : ''
        }`,
      });
    }

    // For full-page screenshots, restore the original webview sizes
    if (isFullPage && this.mainWindow && !this.mainWindow.isDestroyed()) {
      try {
        await this.mainWindow.webContents.executeJavaScript(`
          (function() {
            const saved = window.__mcpSavedWebviewStyles || [];
            const webviews = document.querySelectorAll('webview');
            for (const wv of webviews) {
              const s = saved.find(x => x.webContentsId === wv.getWebContentsId());
              if (s) {
                wv.style.height = s.previousHeight;
                wv.style.transform = s.previousTransform;
              }
            }
            delete window.__mcpSavedWebviewStyles;
          })();
        `);
      } catch (err: any) {
        console.error('[MCP Server] Error restoring webview sizes:', err);
      }
    }

    return {content};
  }

  private async navigate(args: Record<string, any>) {
    if (!args.url) {
      return {
        content: [{type: 'text', text: 'Error: URL parameter is required.'}],
        isError: true,
      };
    }

    let formattedUrl = args.url;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `http://${formattedUrl}`;
    }

    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('open-url', {url: formattedUrl});
    }

    return {
      content: [
        {
          type: 'text',
          text: `Successfully sent navigation request for URL: ${formattedUrl}`,
        },
      ],
    };
  }

  // ─── Tool Dispatch ─────────────────────────────────────────────────────────

  public async callTool(name: string, args: Record<string, any>) {
    switch (name) {
      case 'responsively_list_devices':
        return this.listDevices(args);
      case 'responsively_take_screenshot':
        return this.takeScreenshot(args);
      case 'responsively_navigate':
        return this.navigate(args);
      default:
        return {
          content: [{type: 'text', text: `Error: Unknown tool "${name}"`}],
          isError: true,
        };
    }
  }

  // ─── HTTP / SSE Server ─────────────────────────────────────────────────────

  public start() {
    this.server = http.createServer(async (req, res) => {
      try {
        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        const reqUrl = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);

        // SSE Endpoint
        if (req.method === 'GET' && (reqUrl.pathname === '/sse' || reqUrl.pathname === '/')) {
          const sessionId = uuidv4();
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          });

          this.sseSessions.set(sessionId, res);

          req.on('close', () => {
            this.sseSessions.delete(sessionId);
          });

          // Send endpoint event to client per MCP SSE spec
          res.write(`event: endpoint\ndata: /message?sessionId=${sessionId}\n\n`);
          return;
        }

        // Message Endpoint (POST)
        if (req.method === 'POST' && (reqUrl.pathname === '/message' || reqUrl.pathname === '/')) {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk.toString('utf-8');
          });

          req.on('end', async () => {
            try {
              const request = JSON.parse(body);
              const response = await this.handleJsonRpcRequest(request);

              const sessionId = reqUrl.searchParams.get('sessionId');
              const sseRes = sessionId ? this.sseSessions.get(sessionId) : null;

              if (sseRes && response) {
                sseRes.write(`event: message\ndata: ${JSON.stringify(response)}\n\n`);
                res.writeHead(202, {'Content-Type': 'text/plain'});
                res.end('Accepted');
              } else {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(response || {jsonrpc: '2.0', id: request.id, result: {}}));
              }
            } catch (err: any) {
              res.writeHead(400, {'Content-Type': 'application/json'});
              res.end(
                JSON.stringify({
                  jsonrpc: '2.0',
                  id: null,
                  error: {code: -32700, message: 'Parse error', data: err.message},
                })
              );
            }
          });

          return;
        }

        res.writeHead(404);
        res.end('Not Found');
      } catch (err: any) {
        console.error('[MCP Server] Error handling HTTP request:', err);
        if (!res.headersSent) {
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({error: err.message}));
        }
      }
    });

    this.server.listen(this.port, '127.0.0.1', () => {
      console.log(`[MCP Server] HTTP & SSE server listening on http://127.0.0.1:${this.port}`);
    });

    this.server.on('error', (err) => {
      console.error('[MCP Server] Server error:', err);
    });
  }

  private async handleJsonRpcRequest(req: any) {
    const {jsonrpc, id, method, params} = req;
    if (jsonrpc !== '2.0') return null;

    if (method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'responsively-mcp-server',
            version: '1.0.0',
          },
        },
      };
    }

    if (method === 'notifications/initialized') {
      return null;
    }

    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS,
        },
      };
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      const result = await this.callTool(toolName, toolArgs);
      return {
        jsonrpc: '2.0',
        id,
        result,
      };
    }

    return {
      jsonrpc: '2.0',
      id,
      error: {code: -32601, message: `Method not found: ${method}`},
    };
  }

  public stop() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}

export const mcpServer = new MCPServer();

// Retained for backward compatibility with existing tests and external callers
export async function handleCallTool(
  name: string,
  args: Record<string, any>,
  mainWindow: BrowserWindow | null
) {
  const server = new MCPServer();
  server.setMainWindow(mainWindow);
  return server.callTool(name, args);
}
