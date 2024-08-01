window.electron = {
  ipcRenderer: {
    sendMessage<T>(channel: Channels, ...args: T[]): void {
      throw new Error('Function not implemented.');
    },
    on<T>(
      channel: string,
      func: (...args: T[]) => void
    ): (() => void) | undefined {
      throw new Error('Function not implemented.');
    },
    once<T>(channel: string, func: (...args: T[]) => void): void {
      throw new Error('Function not implemented.');
    },
    invoke<T, P>(channel: string, ...args: T[]): Promise<P> {
      throw new Error('Function not implemented.');
    },
    removeListener<T>(channel: string, func: (...args: T[]) => void): void {
      throw new Error('Function not implemented.');
    },
    removeAllListeners(channel: string): void {
      throw new Error('Function not implemented.');
    },
  },
  store: {
    set: jest.fn(), // Mock the `set` function
    get: jest.fn(), // Mock the `get` function if needed in other parts of your tests
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
