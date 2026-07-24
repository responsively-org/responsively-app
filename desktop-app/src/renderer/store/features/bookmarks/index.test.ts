import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {IBookmarks} from './index';
import {freshImport, mockStoreData, storeSetMock} from '../sliceTestUtils';

type BookmarksModule = typeof import('./index');

const loadSlice = async (bookmarks: IBookmarks[] = []): Promise<BookmarksModule> => {
  mockStoreData({bookmarks});
  return freshImport(() => import('./index'));
};

describe('bookmarks slice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes from the persisted store', async () => {
    const existing = [{id: '1', name: 'Home', address: 'https://a.com'}];
    const {default: reducer} = await loadSlice(existing);
    const state = reducer(undefined, {type: '@@INIT'});
    expect(state.bookmarks).toEqual(existing);
  });

  it('addBookmark assigns an id and persists', async () => {
    const {default: reducer, addBookmark} = await loadSlice([]);
    const state = reducer(undefined, addBookmark({name: 'Docs', address: 'https://docs.com'}));
    expect(state.bookmarks).toHaveLength(1);
    expect(state.bookmarks[0].id).toBeTruthy();
    expect(state.bookmarks[0].name).toBe('Docs');
    expect(storeSetMock()).toHaveBeenCalledWith('bookmarks', state.bookmarks);
  });

  it('addBookmark with an existing id updates that bookmark', async () => {
    const existing = [{id: 'b1', name: 'Old', address: 'https://old.com'}];
    const {default: reducer, addBookmark} = await loadSlice(existing);
    const state = reducer(
      undefined,
      addBookmark({id: 'b1', name: 'New', address: 'https://new.com'})
    );
    expect(state.bookmarks).toEqual([{id: 'b1', name: 'New', address: 'https://new.com'}]);
  });

  it('removeBookmark deletes by id and persists', async () => {
    const existing = [
      {id: 'b1', name: 'One', address: 'https://one.com'},
      {id: 'b2', name: 'Two', address: 'https://two.com'},
    ];
    const {default: reducer, removeBookmark} = await loadSlice(existing);
    const state = reducer(undefined, removeBookmark({id: 'b1'}));
    expect(state.bookmarks).toEqual([{id: 'b2', name: 'Two', address: 'https://two.com'}]);
    expect(storeSetMock()).toHaveBeenCalledWith('bookmarks', state.bookmarks);
  });

  it('removeBookmark with an unknown id is a no-op', async () => {
    const existing = [{id: 'b1', name: 'One', address: 'https://one.com'}];
    const {default: reducer, removeBookmark} = await loadSlice(existing);
    storeSetMock().mockClear();
    const state = reducer(undefined, removeBookmark({id: 'nope'}));
    expect(state.bookmarks).toEqual(existing);
    expect(storeSetMock()).not.toHaveBeenCalled();
  });
});
