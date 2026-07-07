import {IPC_MAIN_CHANNELS} from 'common/constants';
import {McpBridgeRequest, McpBridgeResponse} from 'common/mcp';
import {useEffect} from 'react';
import {useStore} from 'react-redux';
import type {RootState} from '../../store';
import {executeMcpCommand} from './commands';

/**
 * Executes commands sent by the main-process MCP server that need renderer
 * state (Redux) or the device webviews. Renders nothing.
 */
const McpBridge = () => {
  const store = useStore<RootState>();

  useEffect(() => {
    const unsubscribe = window.electron.ipcRenderer.on<McpBridgeRequest>(
      IPC_MAIN_CHANNELS.MCP_COMMAND,
      async (request) => {
        const respond = (response: McpBridgeResponse) =>
          window.electron.ipcRenderer.sendMessage(IPC_MAIN_CHANNELS.MCP_COMMAND_RESPONSE, response);
        try {
          const result = await executeMcpCommand(store, request.command, request.payload);
          respond({requestId: request.requestId, ok: true, result});
        } catch (error) {
          respond({
            requestId: request.requestId,
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    );
    return () => unsubscribe?.();
  }, [store]);

  return null;
};

export default McpBridge;
