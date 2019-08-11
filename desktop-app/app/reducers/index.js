// @flow
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import counter from './counter';
import browser from './browser';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    counter,
    browser,
  });
}
