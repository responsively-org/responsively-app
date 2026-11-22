import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

/**
 * MCP tools open and operate on local file:// documents only when they are
 * .html or .htm files. This keeps local HTML previews (static builds, HTML
 * emails, prototypes) while stopping a connected MCP client from reading
 * arbitrary local files through navigate + read_page/screenshot.
 *
 * Users are unaffected: the address bar can still open any file. Only the
 * MCP tools refuse to load or read other local files.
 */

const HTML_EXTENSION = /\.html?$/i;

const NEXT_STEP = 'Navigate to an http(s) URL or a local .html/.htm file.';

/**
 * Returns why `url` may not be used by the MCP tools, or null when it may.
 * Non-file URLs are always allowed here (other schemes are validated by
 * normalizeUrl). The extension is checked before touching the filesystem, so
 * a request for another kind of file doesn't reveal whether it exists.
 */
export const fileUrlRejection = (url: string): string | null => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'file:') {
    return null;
  }
  if (parsed.host !== '') {
    return `file:// URLs with a host (network paths such as file://server/share) can't be opened. ${NEXT_STEP}`;
  }
  let filePath: string;
  try {
    filePath = fileURLToPath(parsed);
  } catch {
    return `The file:// URL is not a valid local path. ${NEXT_STEP}`;
  }
  const name = path.basename(filePath);
  if (!HTML_EXTENSION.test(filePath)) {
    return `Only .html and .htm files can be opened with file:// URLs (${JSON.stringify(
      name
    )} is not one). ${NEXT_STEP}`;
  }
  let realPath: string;
  let stats: fs.Stats;
  try {
    realPath = fs.realpathSync(filePath);
    stats = fs.statSync(realPath);
  } catch {
    return `No .html/.htm file exists at ${filePath}. Check the path and retry.`;
  }
  if (!stats.isFile()) {
    return `${JSON.stringify(name)} is not a regular file. ${NEXT_STEP}`;
  }
  if (!HTML_EXTENSION.test(realPath)) {
    return `${JSON.stringify(name)} resolves to a file that is not .html or .htm. ${NEXT_STEP}`;
  }
  return null;
};

/** Throws when the MCP tools may not navigate to `url`. */
export const assertAllowedFileUrl = (url: string): void => {
  const rejection = fileUrlRejection(url);
  if (rejection !== null) {
    throw new Error(rejection);
  }
};

/**
 * Throws when the page a preview is showing is a local file the MCP tools may
 * not operate on, e.g. after a local .html page linked to another local file.
 */
export const assertOperablePage = (deviceName: string, url: string): void => {
  const rejection = fileUrlRejection(url);
  if (rejection !== null) {
    throw new Error(
      `The ${deviceName} preview is showing a local file that MCP tools can't access. ${rejection}`
    );
  }
};
