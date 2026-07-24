import fs from 'fs';
import path from 'path';
import {log} from './log';

export interface BridgeManifest {
  name: string;
  version: string;
  tools: Array<{name: string; description?: string; inputSchema: unknown}>;
}

/**
 * The manifest is generated at build time and always sits next to cli.js
 * (resources/mcp/, the Linux userData copy, or release/app/dist/mcp in dev).
 * It answers tools/list while the app is closed, so listing tools never
 * launches the app.
 */
export const loadManifest = (): BridgeManifest => {
  const manifestPath = path.join(__dirname, 'manifest.json');
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    log(`Could not read tool manifest at ${manifestPath}:`, error);
    return {name: 'responsively', version: '0.0.0', tools: []};
  }
};
