'use strict';

const MESSAGE =
  'Responsively App is not installed, or an installed version predates the MCP bridge. ' +
  'Download the latest version from https://responsively.app, launch it once (it records ' +
  'its location for this bridge), then retry. Installed in a custom location? Set the ' +
  'RESPONSIVELY_APP_PATH environment variable to it.';

/**
 * Minimal stdio MCP responder used when no installed app can be found:
 * answers every request (including initialize) with a JSON-RPC error that
 * carries install instructions, so agents surface the problem to the user
 * instead of hanging. MCP stdio framing is newline-delimited JSON.
 */
function runNotInstalledServer() {
  console.error(`[responsively-mcp] ${MESSAGE}`);

  let buffer = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    buffer += chunk;
    let newline = buffer.indexOf('\n');
    while (newline !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      newline = buffer.indexOf('\n');
      if (line === '') {
        continue;
      }
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        continue;
      }
      // Notifications (no id) get no response, per JSON-RPC.
      if (message.id === undefined || message.id === null) {
        continue;
      }
      process.stdout.write(
        `${JSON.stringify({
          jsonrpc: '2.0',
          id: message.id,
          error: {code: -32000, message: MESSAGE},
        })}\n`
      );
    }
  });
  process.stdin.on('end', () => process.exit(1));
}

module.exports = {runNotInstalledServer, MESSAGE};
