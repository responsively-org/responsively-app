import {describe, expect, it} from 'vitest';
import reducer, {addBookmark, removeBookmark, BookmarksState} from './index';

const stateWith = (bookmarks: BookmarksState['bookmarks']): BookmarksState => ({bookmarks});

describe('bookmarks slice', () => {
  it('starts empty', () => {
    expect(reducer(undefined, {type: '@@INIT'})).toEqual({bookmarks: []});
  });

  it('addBookmark assigns an id via prepare', () => {
    const state = reducer(undefined, addBookmark({name: 'Docs', address: 'https://docs.com'}));
    expect(state.bookmarks).toHaveLength(1);
    expect(state.bookmarks[0].id).toBeTruthy();
    expect(state.bookmarks[0].name).toBe('Docs');
  });

  it('addBookmark with an existing id updates that bookmark', () => {
    const existing = stateWith([{id: 'b1', name: 'Old', address: 'https://old.com'}]);
    const state = reducer(
      existing,
      addBookmark({id: 'b1', name: 'New', address: 'https://new.com'})
    );
    expect(state.bookmarks).toEqual([{id: 'b1', name: 'New', address: 'https://new.com'}]);
  });

  it('removeBookmark deletes by id', () => {
    const existing = stateWith([
      {id: 'b1', name: 'One', address: 'https://one.com'},
      {id: 'b2', name: 'Two', address: 'https://two.com'},
    ]);
    const state = reducer(existing, removeBookmark({id: 'b1'}));
    expect(state.bookmarks).toEqual([{id: 'b2', name: 'Two', address: 'https://two.com'}]);
  });

  it('removeBookmark with an unknown id is a no-op', () => {
    const existing = stateWith([{id: 'b1', name: 'One', address: 'https://one.com'}]);
    const state = reducer(existing, removeBookmark({id: 'nope'}));
    expect(state.bookmarks).toEqual(existing.bookmarks);
  });
});
