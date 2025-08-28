window.electron = {
  ipcRenderer: {
    sendMessage: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    invoke: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  store: {
    set: jest.fn(),
    get: jest.fn(),
  },
};

global.IntersectionObserver = jest.fn(() => ({
  root: null,
  rootMargin: '',
  thresholds: [],
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(),
}));
