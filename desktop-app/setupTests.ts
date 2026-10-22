import '@testing-library/jest-dom/vitest';

// Iconify fetches icon data asynchronously and its retry timer can fire after
// jsdom teardown ("Errors 1 error" with every test green). Icons are visual
// chrome in unit tests — stub the component out entirely.
vi.mock('@iconify/react', () => ({
  Icon: (props: {icon: string}) =>
    require('react').createElement('span', {'data-icon': props.icon}),
}));

// Guarded so node-environment suites (e.g. src/mcp-cli) can share this setup.
if (typeof window !== 'undefined') {
  window.electron = {
    ipcRenderer: {
      sendMessage: vi.fn(),
      on: vi.fn(),
      once: vi.fn(),
      invoke: vi.fn(),
      removeListener: vi.fn(),
      removeAllListeners: vi.fn(),
    },
    store: {
      set: vi.fn(),
      get: vi.fn(),
    },
  };
}

// vitest 4 invokes mock implementations with `new` when the caller constructs
// them, so these must be constructible (arrow functions are not).
global.IntersectionObserver = vi.fn(function IntersectionObserverMock() {
  return {
    root: null,
    rootMargin: '',
    scrollMargin: '',
    thresholds: [],
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(),
  };
}) as unknown as typeof IntersectionObserver;

global.ResizeObserver = vi.fn(function ResizeObserverMock() {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
}) as unknown as typeof ResizeObserver;
