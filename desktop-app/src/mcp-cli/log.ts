/**
 * All bridge logging goes to stderr — stdout carries the MCP protocol.
 */
export const log = (...args: unknown[]) => {
  console.error('[responsively-mcp]', ...args);
};
