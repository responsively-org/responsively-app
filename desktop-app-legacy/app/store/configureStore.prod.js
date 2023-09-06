// @flow
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import createRootReducer from '../reducers';

const rootReducer = createRootReducer();
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
const enhancer = applyMiddleware(thunk, heap);

function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer);
}

export default {configureStore};
