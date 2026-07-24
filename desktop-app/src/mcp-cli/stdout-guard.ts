/**
 * stdout carries the MCP protocol; redirect anything that would write there.
 * Imported first by the entry point so it runs before any other module body.
 */
// eslint-disable-next-line no-console
console.log = console.error;

export {};
