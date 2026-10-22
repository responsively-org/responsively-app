import {DEFAULT_MCP_PORT, MCP_PORT_ENV_VAR} from '../../common/mcp';

export const resolveMcpPort = (env: NodeJS.ProcessEnv = process.env): number => {
  const raw = env[MCP_PORT_ENV_VAR];
  if (raw === undefined || raw.trim() === '') {
    return DEFAULT_MCP_PORT;
  }
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return DEFAULT_MCP_PORT;
  }
  return port;
};

const ALLOWED_PROTOCOLS = ['http:', 'https:', 'file:'];

/**
 * Mirrors the AddressBar behavior: bare addresses get https:// prepended
 * (http:// for localhost). Only http(s) and file URLs are allowed.
 */
export const normalizeUrl = (input: string): string => {
  let url = input.trim();
  if (url === '') {
    throw new Error('URL must not be empty');
  }
  // A colon followed by a digit is a host:port (localhost:3000), not a scheme.
  const hasExplicitScheme = url.includes('://') || /^[a-z][a-z0-9+.-]*:(?![0-9])/i.test(url);
  if (!hasExplicitScheme) {
    const protocol =
      url.indexOf('localhost') !== -1 || url.indexOf('127.0.0.1') !== -1 ? 'http://' : 'https://';
    url = protocol + url;
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${input}`);
  }
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    throw new Error(
      `Unsupported URL scheme "${parsed.protocol}" — only http, https and file URLs are allowed`
    );
  }
  return url;
};

const LOOPBACK_HOSTNAMES = ['127.0.0.1', 'localhost', '[::1]'];

export const isAllowedHostHeader = (host: string | undefined, port: number): boolean => {
  if (host === undefined) {
    return false;
  }
  return LOOPBACK_HOSTNAMES.some((hostname) => host === hostname || host === `${hostname}:${port}`);
};
