// @flow
import {combineReducers} from 'redux';
import browser from './browser';
import bookmarks from './bookmarks';
import statusBar from './statusBar';

export default function createRootReducer() {
  return combineReducers({
    browser,
    bookmarks,
    statusBar,
  });
}
