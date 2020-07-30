// @flow
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {createHashHistory} from 'history';
import {routerMiddleware} from 'connected-react-router';
import createRootReducer from '../reducers';

const history = createHashHistory();
const rootReducer = createRootReducer(history);
const router = routerMiddleware(history);
const heap = () => next => action => {
  window.requestIdleCallback(() => {
    if (window.heap) {
      window.heap.track(`ACTION-${action.type}`, {
        type: action.type,
        payload: JSON.stringify(action),
      });
    }
  });
  return next(action);
};
const enhancer = applyMiddleware(thunk, router, heap);

function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer);
}

export default {configureStore, history};
