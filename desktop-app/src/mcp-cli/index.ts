/**
 * Responsively App MCP bridge — a stdio MCP server that proxies to the app's
 * embedded HTTP MCP server, launching the app on demand.
 *
 * This file is bundled to resources/mcp/cli.js and started via require() by
 * the @responsively/mcp npm bootstrap (or `node cli.js` directly).
 */
import './stdout-guard';
import {log} from './log';
import {startBridge} from './server';

startBridge().catch((error) => {
  log('fatal:', error);
  process.exit(1);
});
