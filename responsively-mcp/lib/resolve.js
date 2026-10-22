'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

// Electron userData folder name — from release/app/package.json "name".
const APP_DATA_DIR = 'ResponsivelyApp';
const BRIDGE = ['mcp', 'cli.js'];

/**
 * p may be a mac .app dir, an install dir, a resources dir, or the app
 * binary itself — expand every plausible location of the bridge under it.
 */
const candidatesFromAppPath = (p) => [
  path.join(p, 'Contents', 'Resources', ...BRIDGE),
  path.join(p, ...BRIDGE),
  path.join(p, 'resources', ...BRIDGE),
  path.join(path.dirname(p), 'resources', ...BRIDGE),
  path.join(path.dirname(p), '..', 'Resources', ...BRIDGE),
];

const userDataDir = (platform, env, home) => {
  if (platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', APP_DATA_DIR);
  }
  if (platform === 'win32') {
    return path.join(env.APPDATA || path.join(home, 'AppData', 'Roaming'), APP_DATA_DIR);
  }
  return path.join(env.XDG_CONFIG_HOME || path.join(home, '.config'), APP_DATA_DIR);
};

/**
 * Locates the MCP bridge (mcp/cli.js) shipped inside the installed
 * Responsively App. Resolution order:
 *   1. RESPONSIVELY_MCP_BRIDGE — direct path to a cli.js (dev override)
 *   2. RESPONSIVELY_APP_PATH — user-specified install location
 *   3. The beacon the app writes to its userData dir on every startup
 *   4. Platform default install paths (none exist for Linux AppImages)
 */
function resolveBridgeEntry(env, platform, home = os.homedir(), exists = fs.existsSync) {
  const hit = (file) => (file && exists(file) ? file : null);

  if (hit(env.RESPONSIVELY_MCP_BRIDGE)) {
    return env.RESPONSIVELY_MCP_BRIDGE;
  }

  if (env.RESPONSIVELY_APP_PATH) {
    const direct = candidatesFromAppPath(env.RESPONSIVELY_APP_PATH).map(hit).find(Boolean);
    if (direct) {
      return direct;
    }
  }

  try {
    const beaconPath = path.join(userDataDir(platform, env, home), 'app-location.json');
    const beacon = JSON.parse(fs.readFileSync(beaconPath, 'utf8'));
    const fromBeacon =
      hit(beacon.bridgeEntry) ||
      (beacon.resourcesPath && hit(path.join(beacon.resourcesPath, ...BRIDGE))) ||
      (beacon.binaryPath && candidatesFromAppPath(beacon.binaryPath).map(hit).find(Boolean));
    if (fromBeacon) {
      return fromBeacon;
    }
  } catch {
    // Missing or corrupt beacon — fall through to platform defaults.
  }

  const defaults =
    platform === 'darwin'
      ? ['/Applications/ResponsivelyApp.app', path.join(home, 'Applications', 'ResponsivelyApp.app')]
      : platform === 'win32'
        ? [
            path.join(
              env.LOCALAPPDATA || path.join(home, 'AppData', 'Local'),
              'Programs',
              'ResponsivelyApp'
            ),
          ]
        : [];
  for (const dir of defaults) {
    const found = candidatesFromAppPath(dir).map(hit).find(Boolean);
    if (found) {
      return found;
    }
  }
  return null;
}

module.exports = {resolveBridgeEntry, candidatesFromAppPath, userDataDir};
