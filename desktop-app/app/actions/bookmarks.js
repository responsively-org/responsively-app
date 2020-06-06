export const TOGGLE_BOOKMARK = 'TOGGLE_BOOKMARK';
export const RENAME_BOOKMARK = 'RENAME_BOOKMARK';

// Add or Remove an URL from the bookmark list
export function toggleBookmarkUrl(url, title = null) {		
  return {		
    type: TOGGLE_BOOKMARK,		
    url,		
    title
  };		
}

// Updates bookmark title
export function renameBookmark(bookmark, title) {
  return {
    type: RENAME_BOOKMARK,
    title,
    bookmark
  }
}