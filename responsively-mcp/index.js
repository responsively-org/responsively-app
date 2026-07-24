#!/usr/bin/env node
'use strict';

/**
 * @responsively/mcp — frozen bootstrap.
 *
 * Locates the installed Responsively App and runs its bundled, version-locked
 * MCP bridge in-process. All logic that can evolve (protocol handling, app
 * launching, tool manifest) ships inside the app at resources/mcp/cli.js —
 * keep this file dumb so stale npx caches never matter.
 */

const {resolveBridgeEntry} = require('./lib/resolve');
const {runNotInstalledServer} = require('./lib/not-installed');

const HELP = `responsively-mcp — MCP server for Responsively App (https://responsively.app)

Usage:
  npx -y @responsively/mcp            Start the stdio MCP server (used by MCP clients)
  npx -y @responsively/mcp --help     Show this help
  npx -y @responsively/mcp --version  Show the bootstrap version and resolved bridge

Behavior:
  Proxies MCP requests to the Responsively App. If the app is not running, it
  is launched automatically on the first tool call (never on connect).

Configuration (Claude Code):
  claude mcp add responsively -- npx -y @responsively/mcp

Environment variables:
  RESPONSIVELY_APP_PATH    Path to a custom app install (auto-detected otherwise)
  RESPONSIVELY_MCP_PORT    Port of the app's MCP server (default 12720)
  RESPONSIVELY_MCP_BRIDGE  Direct path to a bridge cli.js (development override)
`;

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
  process.stdout.write(HELP);
  process.exit(0);
}

const entry = resolveBridgeEntry(process.env, process.platform);

if (argv.includes('--version') || argv.includes('-v')) {
  const {version} = require('./package.json');
  process.stdout.write(`@responsively/mcp ${version}\n`);
  process.stdout.write(`bridge: ${entry ?? 'not found (is Responsively App installed?)'}\n`);
  process.exit(0);
}

// From here on stdout belongs to the MCP protocol.
console.log = console.error;

if (entry) {
  console.error(`[responsively-mcp] using bridge: ${entry}`);
  require(entry); // The bridge starts its stdio MCP server on require.
} else {
  runNotInstalledServer();
}
