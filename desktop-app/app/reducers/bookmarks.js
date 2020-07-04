import settings from 'electron-settings';
import console from 'electron-timber';
import {TOGGLE_BOOKMARK, EDIT_BOOKMARK} from '../actions/bookmarks';
import {BOOKMARKS} from '../constants/settingKeys';
import {getWebsiteName} from '../components/WebView/screenshotUtil';

type BookmarksType = {
  title: string,
  url: string,
};

function fetchBookmarks(): BookmarksType {
  return settings.get(BOOKMARKS) || [];
}

function persistBookmarks(bookmarks) {
  settings.set(BOOKMARKS, bookmarks);
}

export default function browser(
  state: BrowserStateType = {
    bookmarks: fetchBookmarks(),
  },
  action: Action
) {
  switch (action.type) {
    case TOGGLE_BOOKMARK:
      let {bookmarks} = state;
      const bookmark = {
        title: action.title || getWebsiteName(action.url),
        url: action.url,
      };
      if (bookmarks.find(b => b.url === action.url)) {
        bookmarks = bookmarks.filter(b => b.url !== action.url);
      } else {
        bookmarks = [...bookmarks, bookmark];
      }
      persistBookmarks(bookmarks);
      return {...state, bookmarks};
    case EDIT_BOOKMARK:
      const updatedBookmarks = state.bookmarks.map(b =>
        b === action.bookmark ? {...b, title: action.title, url: action.url} : b
      );
      persistBookmarks(updatedBookmarks);
      return {...state, bookmarks: updatedBookmarks};
    default:
      return state;
  }
}
