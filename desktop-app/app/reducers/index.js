// @flow
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import browser from './browser';
import bookmarks from './bookmarks'

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    browser,
    bookmarks,
  });
}
