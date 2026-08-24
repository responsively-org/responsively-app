import '@testing-library/jest-dom/vitest';

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
