export const DEFAULT_HOMEPAGE = 'https://www.google.com/';

export const normalizeHomepage = (value: string): string | null => {
  const address = value.trim();
  if (!address) return null;

  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])([:/?#]|$)/i.test(address);
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(address);
  const isHostWithPort = /^(localhost|[^/?#:\s]+\.[^/?#:\s]+):\d+([/?#]|$)/i.test(address);
  const url = hasScheme && !isHostWithPort ? address : `${isLocal ? 'http' : 'https'}://${address}`;

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:', 'file:'].includes(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
};
