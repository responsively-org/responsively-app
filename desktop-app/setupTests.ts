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

global.IntersectionObserver = vi.fn(() => ({
  root: null,
  rootMargin: '',
  thresholds: [],
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(),
}));

global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
