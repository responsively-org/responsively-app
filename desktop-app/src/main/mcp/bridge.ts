import {randomUUID} from 'crypto';
import {BrowserWindow, ipcMain} from 'electron';
import {IPC_MAIN_CHANNELS} from '../../common/constants';
import {McpBridgeCommand, McpBridgeRequest, McpBridgeResponse} from '../../common/mcp';

export type GetMainWindow = () => BrowserWindow | null;

interface PendingRequest {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
}

const pendingRequests = new Map<string, PendingRequest>();

export const initMcpBridge = () => {
  ipcMain.on(IPC_MAIN_CHANNELS.MCP_COMMAND_RESPONSE, (_event, response: McpBridgeResponse) => {
    const pending = pendingRequests.get(response.requestId);
    if (pending === undefined) {
      // Late reply after timeout — drop it.
      return;
    }
    pendingRequests.delete(response.requestId);
    clearTimeout(pending.timer);
    if (response.ok) {
      pending.resolve(response.result);
    } else {
      pending.reject(new Error(response.error ?? 'Unknown renderer error'));
    }
  });
};

export const sendBridgeCommand = <R>(
  getMainWindow: GetMainWindow,
  command: McpBridgeCommand,
  payload?: unknown,
  timeoutMs = 10_000
): Promise<R> => {
  const mainWindow = getMainWindow();
  if (mainWindow === null || mainWindow.isDestroyed()) {
    return Promise.reject(
      new Error('The Responsively App window is not open. Open the app window and retry.')
    );
  }
  const requestId = randomUUID();
  return new Promise<R>((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingRequests.delete(requestId);
      reject(new Error(`Responsively did not respond to '${command}' within ${timeoutMs}ms`));
    }, timeoutMs);
    pendingRequests.set(requestId, {
      resolve: resolve as (result: unknown) => void,
      reject,
      timer,
    });
    const request: McpBridgeRequest = {requestId, command, payload};
    mainWindow.webContents.send(IPC_MAIN_CHANNELS.MCP_COMMAND, request);
  });
};
