import type {Mock} from 'vitest';

/**
 * The store slices read window.electron.store at module load, so tests must
 * install per-key mock data BEFORE importing a slice, and re-import it fresh
 * per test (vi.resetModules) to exercise the initializers.
 *
 * These helpers lock in the CURRENT persistence behavior (store.set calls
 * fired synchronously inside reducers) as a regression net for the v2
 * migration to listener-middleware persistence.
 */
export const mockStoreData = (data: Record<string, unknown>) => {
  // electron-store returns a freshly parsed value on every get — clone per
  // call so tests can't accidentally share (Immer-frozen) references between
  // Redux state and the mocked store, which the real store never does.
  (window.electron.store.get as Mock).mockImplementation((key: string) =>
    data[key] === undefined ? undefined : structuredClone(data[key])
  );
};

export const storeSetMock = () => window.electron.store.set as Mock;

export const freshImport = async <T>(importer: () => Promise<T>): Promise<T> => {
  vi.resetModules();
  return importer();
};
