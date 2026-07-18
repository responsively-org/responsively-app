import {describe, expect, it} from 'vitest';
import {DEFAULT_MCP_PORT, MCP_PORT_ENV_VAR} from '../../common/mcp';
import {isAllowedHostHeader, normalizeUrl, resolveMcpPort} from './utils';

describe('resolveMcpPort', () => {
  it('returns the default port when the env var is unset', () => {
    expect(resolveMcpPort({})).toBe(DEFAULT_MCP_PORT);
  });

  it('returns the default port when the env var is empty', () => {
    expect(resolveMcpPort({[MCP_PORT_ENV_VAR]: '  '})).toBe(DEFAULT_MCP_PORT);
  });

  it('parses a valid port', () => {
    expect(resolveMcpPort({[MCP_PORT_ENV_VAR]: '23456'})).toBe(23456);
  });

  it('rejects non-numeric and out-of-range values', () => {
    expect(resolveMcpPort({[MCP_PORT_ENV_VAR]: 'abc'})).toBe(DEFAULT_MCP_PORT);
    expect(resolveMcpPort({[MCP_PORT_ENV_VAR]: '12720.5'})).toBe(DEFAULT_MCP_PORT);
    expect(resolveMcpPort({[MCP_PORT_ENV_VAR]: '0'})).toBe(DEFAULT_MCP_PORT);
    expect(resolveMcpPort({[MCP_PORT_ENV_VAR]: '70000'})).toBe(DEFAULT_MCP_PORT);
  });
});

describe('normalizeUrl', () => {
  it('prepends https:// to bare domains', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
  });

  it('prepends http:// to localhost addresses', () => {
    expect(normalizeUrl('localhost:3000')).toBe('http://localhost:3000');
    expect(normalizeUrl('127.0.0.1:8080/page')).toBe('http://127.0.0.1:8080/page');
  });

  it('passes through http, https and file URLs', () => {
    expect(normalizeUrl('http://example.com/a')).toBe('http://example.com/a');
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    expect(normalizeUrl('file:///Users/dev/index.html')).toBe('file:///Users/dev/index.html');
  });

  it('rejects disallowed schemes', () => {
    // eslint-disable-next-line no-script-url
    expect(() => normalizeUrl('javascript:alert(1)')).toThrow(/Unsupported URL scheme/);
    expect(() => normalizeUrl('data://text/html,hi')).toThrow(/Unsupported URL scheme/);
    expect(() => normalizeUrl('responsively://open')).toThrow(/Unsupported URL scheme/);
  });

  it('rejects empty and unparseable input', () => {
    expect(() => normalizeUrl('   ')).toThrow(/must not be empty/);
    expect(() => normalizeUrl('http://')).toThrow(/Invalid URL/);
  });
});

describe('isAllowedHostHeader', () => {
  it('accepts loopback hosts with and without the port', () => {
    expect(isAllowedHostHeader('127.0.0.1:12720', 12720)).toBe(true);
    expect(isAllowedHostHeader('localhost:12720', 12720)).toBe(true);
    expect(isAllowedHostHeader('[::1]:12720', 12720)).toBe(true);
    expect(isAllowedHostHeader('localhost', 12720)).toBe(true);
  });

  it('rejects missing, external, and wrong-port hosts', () => {
    expect(isAllowedHostHeader(undefined, 12720)).toBe(false);
    expect(isAllowedHostHeader('evil.com', 12720)).toBe(false);
    expect(isAllowedHostHeader('evil.com:12720', 12720)).toBe(false);
    expect(isAllowedHostHeader('localhost:9999', 12720)).toBe(false);
  });
});
