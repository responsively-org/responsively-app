export const TOGGLE_BOOKMARK = 'TOGGLE_BOOKMARK';
export const EDIT_BOOKMARK = 'EDIT_BOOKMARK';

// Add or Remove an URL from the bookmark list
export function toggleBookmarkUrl(url, pageMeta = {}) {
  return {
    type: TOGGLE_BOOKMARK,
    url,
    title: pageMeta.title,
  };
}

// Updates bookmark title
export function editBookmark(bookmark, {title, url}) {
  return {
    type: EDIT_BOOKMARK,
    title,
    url,
    bookmark,
  };
}
