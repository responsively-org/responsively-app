import {configureStore} from '@reduxjs/toolkit';
import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {SHORTCUT_CHANNEL} from 'renderer/components/KeyboardShortcutsManager/constants';
import {keyboardShortcutsPubsub} from 'renderer/components/KeyboardShortcutsManager/useMousetrapEmitter';
import bookmarksReducer, {IBookmarks} from 'renderer/store/features/bookmarks';
import BookmarkButton from './BookmarkButton';

const address = 'https://example.com/docs';
const pageTitle = 'Example documentation';

const renderBookmark = (
  bookmarks: IBookmarks[] = [],
  currentAddress = address,
  title = pageTitle
) => {
  const store = configureStore({
    reducer: {bookmarks: bookmarksReducer},
    preloadedState: {bookmarks: {bookmarks}},
  });
  const button = (url: string, name: string) => (
    <Provider store={store}>
      <BookmarkButton currentAddress={url} pageTitle={name} />
    </Provider>
  );
  const result = render(button(currentAddress, title));
  return {
    getBookmarks: () => store.getState().bookmarks.bookmarks,
    navigate: (url: string, name = title) => result.rerender(button(url, name)),
  };
};

const pressBookmarkShortcut = async () => {
  await act(async () => {
    await keyboardShortcutsPubsub.publish(SHORTCUT_CHANNEL.BOOKMARK);
  });
};

afterEach(cleanup);

describe('BookmarkButton', () => {
  it('immediately bookmarks a clicked page and keeps it when dismissed', () => {
    const {getBookmarks} = renderBookmark();

    fireEvent.click(screen.getByRole('button', {name: 'Add bookmark'}));

    expect(getBookmarks()).toEqual([{id: expect.any(String), name: pageTitle, address}]);
    expect(screen.getByRole('button', {name: 'Edit bookmark'})).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    const nameInput = screen.getByLabelText('Bookmark Name') as HTMLInputElement;
    expect(nameInput).toHaveFocus();
    expect(nameInput.selectionStart).toBe(0);
    expect(nameInput.selectionEnd).toBe(pageTitle.length);

    fireEvent.keyDown(nameInput, {key: 'Escape'});

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getBookmarks()).toHaveLength(1);
    expect(screen.getByRole('button', {name: 'Edit bookmark'})).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('adds with the shortcut and preserves the draft on repeated shortcuts', async () => {
    const {getBookmarks} = renderBookmark();

    await pressBookmarkShortcut();
    expect(getBookmarks()).toHaveLength(1);
    const {id} = getBookmarks()[0];
    fireEvent.change(screen.getByLabelText('Bookmark Name'), {target: {value: 'My docs'}});
    await pressBookmarkShortcut();
    expect(screen.getByLabelText('Bookmark Name')).toHaveValue('My docs');
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    expect(getBookmarks()).toEqual([{id, name: 'My docs', address}]);

    await pressBookmarkShortcut();
    expect(screen.getByLabelText('Bookmark Name')).toHaveValue('My docs');
    expect(getBookmarks()).toHaveLength(1);
  });

  it.each(['Escape', 'outside click', 'preview focus', 'second star click'])(
    'applies edits on %s without removing or duplicating a bookmark',
    (dismissal) => {
      const {getBookmarks} = renderBookmark([{id: 'saved', name: 'Old title', address}]);
      fireEvent.click(screen.getByRole('button', {name: 'Edit bookmark'}));
      fireEvent.change(screen.getByLabelText('Bookmark Name'), {target: {value: 'Updated title'}});

      if (dismissal === 'Escape') fireEvent.keyDown(document, {key: 'Escape'});
      else if (dismissal === 'outside click') fireEvent.mouseDown(document.body);
      else if (dismissal === 'second star click') {
        fireEvent.click(screen.getByRole('button', {name: 'Edit bookmark'}));
      } else fireEvent.blur(window);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(getBookmarks()).toEqual([{id: 'saved', name: 'Updated title', address}]);
    }
  );

  it('updates the same bookmark when its URL is edited and the form is submitted', () => {
    const {getBookmarks, navigate} = renderBookmark([{id: 'saved', name: pageTitle, address}]);
    fireEvent.click(screen.getByRole('button', {name: 'Edit bookmark'}));
    const urlInput = screen.getByLabelText('Address');
    fireEvent.change(urlInput, {target: {value: 'https://example.com/updated'}});
    fireEvent.submit(urlInput.closest('form')!);

    expect(getBookmarks()).toEqual([
      {id: 'saved', name: pageTitle, address: 'https://example.com/updated'},
    ]);
    expect(screen.getByRole('button', {name: 'Add bookmark'})).toBeVisible();
    navigate('https://example.com/updated');
    expect(screen.getByRole('button', {name: 'Edit bookmark'})).toBeVisible();
  });

  it.each([false, true])('explicitly removes a bookmark (previously saved: %s)', (saved) => {
    const {getBookmarks} = renderBookmark(saved ? [{id: 'saved', name: pageTitle, address}] : []);
    fireEvent.click(screen.getByRole('button', {name: saved ? 'Edit bookmark' : 'Add bookmark'}));
    fireEvent.change(screen.getByLabelText('Address'), {
      target: {value: 'https://example.com/edited'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Remove'}));

    expect(getBookmarks()).toEqual([]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Add bookmark'})).toBeVisible();
  });

  it('saves and closes the original page editor on navigation', () => {
    const {getBookmarks, navigate} = renderBookmark();
    fireEvent.click(screen.getByRole('button', {name: 'Add bookmark'}));
    fireEvent.change(screen.getByLabelText('Bookmark Name'), {target: {value: 'Original page'}});

    navigate('https://example.com/next', 'Next page');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getBookmarks()).toEqual([{id: expect.any(String), name: 'Original page', address}]);
    expect(screen.getByRole('button', {name: 'Add bookmark'})).toBeVisible();
  });

  it('retains edits when the page title changes while the editor is open', () => {
    const {navigate} = renderBookmark();
    fireEvent.click(screen.getByRole('button', {name: 'Add bookmark'}));
    fireEvent.change(screen.getByLabelText('Bookmark Name'), {target: {value: 'My title'}});
    navigate(address, 'New page title');

    expect(screen.getByLabelText('Bookmark Name')).toHaveValue('My title');
  });

  it('uses the URL as the bookmark name when the page has no title', () => {
    const {getBookmarks} = renderBookmark([], address, '');
    fireEvent.click(screen.getByRole('button', {name: 'Add bookmark'}));
    expect(getBookmarks()[0].name).toBe(address);
  });

  it.each(['', '   '])(
    'does not create bookmarks for an empty current address (%j)',
    async (url) => {
      const {getBookmarks} = renderBookmark([], url);
      expect(screen.getByRole('button', {name: 'Add bookmark'})).toBeDisabled();
      await pressBookmarkShortcut();
      expect(getBookmarks()).toEqual([]);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }
  );
});
