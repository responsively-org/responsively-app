const OPENABLE_PROTOCOLS = ['http:', 'https:', 'file:'];

/**
 * Scheme allowlist for URLs that arrive from outside the app (CLI args,
 * protocol deep links, second-instance argv) before they reach the previews.
 */
export const isOpenableUrl = (arg?: string): boolean => {
  if (arg == null || arg === '') {
    return false;
  }
  try {
    return OPENABLE_PROTOCOLS.includes(new URL(arg).protocol);
  } catch {
    return false;
  }
};
