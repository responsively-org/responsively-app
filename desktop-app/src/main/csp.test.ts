import {describe, expect, it} from 'vitest';
import {injectHostIntoCsp} from './csp';

const HOST = 'localhost:12719';

describe('injectHostIntoCsp', () => {
  it('adds the host to each mirrored directive', () => {
    expect(injectHostIntoCsp("default-src 'self'; script-src 'self'", HOST)).toBe(
      `default-src ${HOST} 'self'; script-src ${HOST} 'self'`
    );
  });

  it('expands connect-src with websocket origins', () => {
    expect(injectHostIntoCsp("connect-src 'self'", HOST)).toBe(
      `connect-src ${HOST} wss://${HOST} ws://${HOST} 'self'`
    );
  });

  it('does not corrupt script-src-elem when it precedes script-src', () => {
    expect(injectHostIntoCsp("script-src-elem 'self'; script-src 'none'", HOST)).toBe(
      `script-src-elem ${HOST} 'self'; script-src ${HOST} 'none'`
    );
  });

  it('matches directive names case-insensitively', () => {
    expect(injectHostIntoCsp("Script-Src 'self'", HOST)).toBe(`script-src ${HOST} 'self'`);
  });

  it('handles comma-joined policies', () => {
    expect(injectHostIntoCsp("default-src 'self', script-src 'none'", HOST)).toBe(
      `default-src ${HOST} 'self', script-src ${HOST} 'none'`
    );
  });

  it('handles a directive with no sources at end of policy', () => {
    expect(injectHostIntoCsp('script-src', HOST)).toBe(`script-src ${HOST}`);
  });

  it('leaves policies without mirrored directives untouched', () => {
    expect(injectHostIntoCsp("img-src 'self'; style-src 'unsafe-inline'", HOST)).toBe(
      "img-src 'self'; style-src 'unsafe-inline'"
    );
  });
});
