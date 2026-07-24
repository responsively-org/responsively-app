/**
 * All bridge logging goes to stderr — stdout carries the MCP protocol.
 */
export const log = (...args: unknown[]) => {
  // eslint-disable-next-line no-console
  console.error('[responsively-mcp]', ...args);
};
