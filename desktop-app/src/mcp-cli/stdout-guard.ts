/**
 * stdout carries the MCP protocol; redirect anything that would write there.
 * Imported first by the entry point so it runs before any other module body.
 */

console.log = console.error;

export {};
