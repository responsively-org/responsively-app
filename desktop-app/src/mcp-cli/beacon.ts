import fs from 'fs';
import os from 'os';
import path from 'path';
import {DEFAULT_MCP_PORT, MCP_BEACON_FILENAME, MCP_PORT_ENV_VAR, McpBeacon} from '../common/mcp';

const APP_DATA_DIR = 'ResponsivelyApp';

export const userDataDir = (
  platform: NodeJS.Platform = process.platform,
  env: NodeJS.ProcessEnv = process.env,
  home: string = os.homedir()
): string => {
  if (platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', APP_DATA_DIR);
  }
  if (platform === 'win32') {
    return path.join(env.APPDATA ?? path.join(home, 'AppData', 'Roaming'), APP_DATA_DIR);
  }
  return path.join(env.XDG_CONFIG_HOME ?? path.join(home, '.config'), APP_DATA_DIR);
};

export const readBeacon = (): McpBeacon | null => {
  try {
    const raw = fs.readFileSync(path.join(userDataDir(), MCP_BEACON_FILENAME), 'utf8');
    return JSON.parse(raw) as McpBeacon;
  } catch {
    return null;
  }
};

const isValidPort = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 65535;

/**
 * Port resolution: explicit env override → whatever port the app last
 * announced in its beacon → the default.
 */
export const resolveTargetPort = (env: NodeJS.ProcessEnv, beacon: McpBeacon | null): number => {
  const fromEnv = Number(env[MCP_PORT_ENV_VAR]);
  if (env[MCP_PORT_ENV_VAR] !== undefined && isValidPort(fromEnv)) {
    return fromEnv;
  }
  if (beacon !== null && isValidPort(beacon.mcpPort)) {
    return beacon.mcpPort;
  }
  return DEFAULT_MCP_PORT;
};
