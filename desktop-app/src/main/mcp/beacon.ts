import {app} from 'electron';
import fs from 'fs';
import path from 'path';
import {MCP_BEACON_FILENAME, McpBeacon} from '../../common/mcp';

/**
 * Returns a bridge entry point that outlives this process. On Linux the app
 * ships as an AppImage whose resources are a transient /tmp mount, so the
 * bridge is copied into userData where the npm bootstrap can load it while
 * the app is closed.
 */
const stableBridgeEntry = (): string | undefined => {
  if (!app.isPackaged) {
    return undefined;
  }
  const packagedEntry = path.join(process.resourcesPath, 'mcp', 'cli.js');
  if (process.platform !== 'linux') {
    return fs.existsSync(packagedEntry) ? packagedEntry : undefined;
  }
  if (!fs.existsSync(packagedEntry)) {
    return undefined;
  }
  const stableDir = path.join(app.getPath('userData'), 'mcp');
  fs.mkdirSync(stableDir, {recursive: true});
  ['cli.js', 'manifest.json'].forEach((file) => {
    fs.copyFileSync(path.join(process.resourcesPath, 'mcp', file), path.join(stableDir, file));
  });
  return path.join(stableDir, 'cli.js');
};

export const writeMcpBeacon = (mcpPort: number): void => {
  try {
    const beacon: McpBeacon = {
      // AppImage process.execPath points into a transient mount; $APPIMAGE is
      // the real file the user keeps.
      binaryPath: process.env.APPIMAGE ?? process.execPath,
      ...(app.isPackaged ? {resourcesPath: process.resourcesPath} : {}),
      bridgeEntry: stableBridgeEntry(),
      version: app.getVersion(),
      mcpPort,
      writtenAt: new Date().toISOString(),
    };
    const userDataDir = app.getPath('userData');
    fs.mkdirSync(userDataDir, {recursive: true});
    fs.writeFileSync(path.join(userDataDir, MCP_BEACON_FILENAME), JSON.stringify(beacon, null, 2));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[mcp] Could not write the app-location beacon:', error);
  }
};
