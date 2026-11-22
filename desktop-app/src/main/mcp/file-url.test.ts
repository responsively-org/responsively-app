import fs from 'fs';
import os from 'os';
import path from 'path';
import {pathToFileURL} from 'url';
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {assertAllowedFileUrl, assertOperablePage, fileUrlRejection} from './file-url';

const canSymlink = process.platform !== 'win32';

describe('fileUrlRejection', () => {
  let dir: string;
  const url = (name: string) => pathToFileURL(path.join(dir, name)).href;

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-file-url-'));
    fs.writeFileSync(path.join(dir, 'index.html'), '<p>hi</p>');
    fs.writeFileSync(path.join(dir, 'PAGE.HTM'), '<p>hi</p>');
    fs.writeFileSync(path.join(dir, 'with space.html'), '<p>hi</p>');
    fs.writeFileSync(path.join(dir, 'notes.txt'), 'secret');
    fs.mkdirSync(path.join(dir, 'folder.html'));
    if (canSymlink) {
      fs.symlinkSync(path.join(dir, 'notes.txt'), path.join(dir, 'disguised.html'));
      fs.symlinkSync(path.join(dir, 'index.html'), path.join(dir, 'alias.html'));
      fs.symlinkSync(path.join(dir, 'index.html'), path.join(dir, 'alias-link'));
    }
  });

  afterAll(() => {
    fs.rmSync(dir, {recursive: true, force: true});
  });

  it('allows non-file URLs', () => {
    expect(fileUrlRejection('https://example.com/notes.txt')).toBeNull();
    expect(fileUrlRejection('http://localhost:3000')).toBeNull();
    expect(fileUrlRejection('not a url')).toBeNull();
  });

  it('allows existing .html and .htm files, case-insensitively', () => {
    expect(fileUrlRejection(url('index.html'))).toBeNull();
    expect(fileUrlRejection(url('PAGE.HTM'))).toBeNull();
    expect(fileUrlRejection(url('with space.html'))).toBeNull();
  });

  it('ignores the query string and fragment', () => {
    expect(fileUrlRejection(`${url('index.html')}?a=1#top`)).toBeNull();
    expect(fileUrlRejection(`${url('notes.txt')}?x=.html`)).toMatch(/Only \.html and \.htm/);
    expect(fileUrlRejection(`${url('notes.txt')}#.html`)).toMatch(/Only \.html and \.htm/);
  });

  it('rejects other file types with an actionable message', () => {
    expect(fileUrlRejection(url('notes.txt'))).toBe(
      'Only .html and .htm files can be opened with file:// URLs ("notes.txt" is not one). ' +
        'Navigate to an http(s) URL or a local .html/.htm file.'
    );
    expect(fileUrlRejection(url('index.html.txt'))).toMatch(/Only \.html and \.htm/);
    expect(fileUrlRejection(pathToFileURL(dir).href)).toMatch(/Only \.html and \.htm/);
    expect(fileUrlRejection(`${url('index.html')}/`)).toMatch(/Only \.html and \.htm/);
  });

  it('checks the extension before touching the filesystem', () => {
    const realpath = vi.spyOn(fs, 'realpathSync');
    try {
      fileUrlRejection(url('does-not-exist.txt'));
      expect(realpath).not.toHaveBeenCalled();
    } finally {
      realpath.mockRestore();
    }
  });

  it('decodes the path before checking the extension', () => {
    expect(fileUrlRejection(url('with space.html').replace('.html', '%2Ehtml'))).toBeNull();
    expect(fileUrlRejection(`${url('notes')}%2Etxt`)).toMatch(/Only \.html and \.htm/);
  });

  it('rejects file URLs with a host (UNC / network paths)', () => {
    expect(fileUrlRejection('file://server/share/index.html')).toMatch(/with a host/);
  });

  it('treats file://localhost as a local path (the URL parser drops the host)', () => {
    expect(fileUrlRejection(url('index.html').replace('file://', 'file://localhost'))).toBeNull();
    expect(fileUrlRejection('file://localhost/etc/passwd')).toMatch(/Only \.html and \.htm/);
  });

  it('rejects missing files and directories', () => {
    expect(fileUrlRejection(url('missing.html'))).toMatch(/No \.html\/\.htm file exists/);
    expect(fileUrlRejection(url('folder.html'))).toMatch(/is not a regular file/);
  });

  it.runIf(canSymlink)('rejects a .html symlink to another kind of file', () => {
    expect(fileUrlRejection(url('disguised.html'))).toMatch(/resolves to a file that is not/);
  });

  it.runIf(canSymlink)('allows symlinks that resolve to an .html file', () => {
    expect(fileUrlRejection(url('alias.html'))).toBeNull();
    // The requested path itself must still end in .html/.htm.
    expect(fileUrlRejection(url('alias-link'))).toMatch(/Only \.html and \.htm/);
  });

  it('assertAllowedFileUrl throws the rejection', () => {
    expect(() => assertAllowedFileUrl(url('index.html'))).not.toThrow();
    expect(() => assertAllowedFileUrl(url('notes.txt'))).toThrow(/"notes.txt" is not one/);
  });

  it('assertOperablePage names the device', () => {
    expect(() => assertOperablePage('iPhone 12 Pro', 'https://example.com')).not.toThrow();
    expect(() => assertOperablePage('iPhone 12 Pro', url('notes.txt'))).toThrow(
      /^The iPhone 12 Pro preview is showing a local file that MCP tools can't access\. Only/
    );
  });
});
