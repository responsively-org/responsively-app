// @flow
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import browser from './browser';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    browser,
  });
}
