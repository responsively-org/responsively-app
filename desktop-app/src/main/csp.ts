// Directives that must admit the BrowserSync host so the injected
// event-mirroring client can load and open its socket.
const MIRRORED_DIRECTIVES = [
  'default-src',
  'script-src',
  'script-src-elem',
  'connect-src',
  'child-src',
  'worker-src',
];

const sourcesFor = (directive: string, host: string): string =>
  directive === 'connect-src' ? `${host} wss://${host} ws://${host}` : host;

/**
 * Adds `host` to the mirrored directives of a CSP policy string. Matches
 * directive names only at directive position (start of a policy, or after a
 * `;`/`,` separator) with an exact-name boundary — a plain substring replace
 * corrupts policies where e.g. `script-src-elem` appears before `script-src`.
 * Kept free of electron/browser-sync imports so it stays unit-testable.
 */
export const injectHostIntoCsp = (policy: string, host: string): string =>
  MIRRORED_DIRECTIVES.reduce(
    (result, directive) =>
      result.replace(
        new RegExp(`(^|[;,])(\\s*)${directive}(?=[\\s;,]|$)`, 'gi'),
        `$1$2${directive} ${sourcesFor(directive, host)}`
      ),
    policy
  );
