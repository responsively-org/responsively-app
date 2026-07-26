import {describe, expect, it} from 'vitest';
import {isOpenableUrl} from './url-validation';

describe('isOpenableUrl', () => {
  it('accepts http, https and file URLs', () => {
    expect(isOpenableUrl('http://example.com')).toBe(true);
    expect(isOpenableUrl('https://example.com/path?q=1')).toBe(true);
    expect(isOpenableUrl('file:///Users/me/index.html')).toBe(true);
  });

  it('rejects other schemes', () => {
    expect(isOpenableUrl('javascript:alert(1)')).toBe(false);
    expect(isOpenableUrl('chrome://settings')).toBe(false);
    expect(isOpenableUrl('smb://server/share')).toBe(false);
    expect(isOpenableUrl('responsively://https://example.com')).toBe(false);
  });

  it('rejects non-URLs and empty input', () => {
    expect(isOpenableUrl('not a url')).toBe(false);
    expect(isOpenableUrl('')).toBe(false);
    expect(isOpenableUrl(undefined)).toBe(false);
  });

  it('does not memoize across calls', () => {
    expect(isOpenableUrl('https://example.com')).toBe(true);
    expect(isOpenableUrl('garbage')).toBe(false);
    expect(isOpenableUrl('https://example.com')).toBe(true);
  });
});
