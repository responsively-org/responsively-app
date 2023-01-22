/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function isValidCliArgURL(arg?: string): boolean {
  if (arg == null || arg === '') {
    return false;
  }
  try {
    const url = new URL(arg);
    if (
      url.protocol === 'http:' ||
      url.protocol === 'https:' ||
      url.protocol === 'file:'
    ) {
      return true;
    }
    // eslint-disable-next-line no-console
    console.warn('Protocol not supported', url.protocol);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Not a valid URL', arg, e);
  }
  return false;
}
