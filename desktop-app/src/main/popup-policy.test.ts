import {describe, expect, it} from 'vitest';
import {decidePopupAction} from './popup-policy';

describe('decidePopupAction', () => {
  it('routes web URLs to the previews by default', () => {
    expect(decidePopupAction('https://example.com/page', 'in-preview')).toEqual({
      kind: 'in-preview',
      url: 'https://example.com/page',
    });
    expect(decidePopupAction('http://example.com', 'in-preview')).toEqual({
      kind: 'in-preview',
      url: 'http://example.com',
    });
  });

  it('routes web URLs to the OS browser when the setting is external', () => {
    expect(decidePopupAction('https://example.com', 'external')).toEqual({
      kind: 'external',
      url: 'https://example.com',
    });
  });

  it('always sends mailto and tel links to the OS', () => {
    expect(decidePopupAction('mailto:hi@example.com', 'in-preview')).toEqual({
      kind: 'external',
      url: 'mailto:hi@example.com',
    });
    expect(decidePopupAction('tel:+1234567890', 'external')).toEqual({
      kind: 'external',
      url: 'tel:+1234567890',
    });
  });

  it('denies other schemes and unparseable URLs', () => {
    expect(decidePopupAction('javascript:alert(1)', 'in-preview')).toEqual({kind: 'deny'});
    expect(decidePopupAction('file:///etc/passwd', 'in-preview')).toEqual({kind: 'deny'});
    expect(decidePopupAction('smb://server/share', 'external')).toEqual({kind: 'deny'});
    expect(decidePopupAction('about:blank', 'in-preview')).toEqual({kind: 'deny'});
    expect(decidePopupAction('', 'in-preview')).toEqual({kind: 'deny'});
  });
});
