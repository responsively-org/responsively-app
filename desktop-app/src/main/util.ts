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

let isCliArgResult: boolean | undefined;

export function isValidCliArgURL(arg?: string): boolean {
  if (isCliArgResult !== undefined) {
    return isCliArgResult;
  }
  if (arg == null || arg === '') {
    isCliArgResult = false;
    return false;
  }
  try {
    const url = new URL(arg);
    if (
      url.protocol === 'http:' ||
      url.protocol === 'https:' ||
      url.protocol === 'file:'
    ) {
      isCliArgResult = true;
      return true;
    }
    // eslint-disable-next-line no-console
    console.warn('Protocol not supported', url.protocol);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Not a valid URL', arg, e);
  }
  isCliArgResult = false;
  return false;
}
