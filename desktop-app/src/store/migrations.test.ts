import type Store from 'electron-store';

import {PREVIEW_LAYOUTS} from '../common/constants';
import {migrations} from './migrations';

type StoreState = {
  ui?: {
    previewlayout?: string;
    previewLayout?: string;
  };
};

const getValue = (state: StoreState, key: string) =>
  key.split('.').reduce<unknown>((current, segment) => {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, state);

const setValue = (state: StoreState, key: string, value: unknown) => {
  const segments = key.split('.');
  const lastSegment = segments.pop();

  if (lastSegment == null) {
    return;
  }

  let current: Record<string, unknown> = state as Record<string, unknown>;
  for (const segment of segments) {
    if (current[segment] == null || typeof current[segment] !== 'object') {
      current[segment] = {};
    }

    current = current[segment] as Record<string, unknown>;
  }

  current[lastSegment] = value;
};

const deleteValue = (state: StoreState, key: string) => {
  const segments = key.split('.');
  const lastSegment = segments.pop();

  if (lastSegment == null) {
    return;
  }

  let current: Record<string, unknown> | undefined = state as Record<string, unknown>;
  for (const segment of segments) {
    const next = current?.[segment];
    if (next == null || typeof next !== 'object') {
      return;
    }

    current = next as Record<string, unknown>;
  }

  delete current?.[lastSegment];
};

const createStoreMock = (state: StoreState) =>
  ({
    get: vi.fn((key: string) => getValue(state, key)),
    set: vi.fn((key: string, value: unknown) => setValue(state, key, value)),
    delete: vi.fn((key: string) => deleteValue(state, key)),
  } as unknown as Store);

describe('migrations', () => {
  it('moves the legacy previewlayout value to previewLayout', () => {
    const state: StoreState = {
      ui: {
        previewlayout: PREVIEW_LAYOUTS.INDIVIDUAL,
      },
    };
    const store = createStoreMock(state);

    migrations['1.18.1'](store);

    expect(store.set).toHaveBeenCalledWith('ui.previewLayout', PREVIEW_LAYOUTS.INDIVIDUAL);
    expect(store.delete).toHaveBeenCalledWith('ui.previewlayout');
    expect(state.ui?.previewLayout).toBe(PREVIEW_LAYOUTS.INDIVIDUAL);
    expect(state.ui?.previewlayout).toBeUndefined();
  });

  it('keeps the new previewLayout value when both keys exist', () => {
    const state: StoreState = {
      ui: {
        previewlayout: PREVIEW_LAYOUTS.COLUMN,
        previewLayout: PREVIEW_LAYOUTS.MASONRY,
      },
    };
    const store = createStoreMock(state);

    migrations['1.18.1'](store);

    expect(store.set).not.toHaveBeenCalledWith('ui.previewLayout', PREVIEW_LAYOUTS.COLUMN);
    expect(store.delete).toHaveBeenCalledWith('ui.previewlayout');
    expect(state.ui?.previewLayout).toBe(PREVIEW_LAYOUTS.MASONRY);
    expect(state.ui?.previewlayout).toBeUndefined();
  });
});
