export function isNullOrWhiteSpaces(str: string): boolean {
  return str == null || /^\s*$/.test(str);
}
