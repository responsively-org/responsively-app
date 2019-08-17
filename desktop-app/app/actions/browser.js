// @flow
import type {Dispatch, BrowserStateType} from '../reducers/types';
import pubsub from 'pubsub.js';
import {SCROLL_DOWN, SCROLL_UP} from '../constants/pubsubEvents';

export const NEW_ADDRESS = 'NEW_ADDRESS';
export const NEW_ZOOM_LEVEL = 'NEW_ZOOM_LEVEL';
export const NEW_SCROLL_POSITION = 'NEW_SCROLL_POSITION';

export function newAddress(address) {
  return {
    type: NEW_ADDRESS,
    address,
  };
}

export function newZoomLevel(zoomLevel) {
  return {
    type: NEW_ZOOM_LEVEL,
    zoomLevel,
  };
}

export function newScrollPosition(scrollPosition) {
  return {
    type: NEW_SCROLL_POSITION,
    scrollPosition,
  };
}

export function onAddressChange(newURL) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {address},
    } = getState();

    console.log('newURL', newURL);

    if (newURL === address) {
      return;
    }

    dispatch(newAddress(newURL));
  };
}

export function onZoomChange(newLevel) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {zoomLevel},
    } = getState();

    if (newLevel === zoomLevel) {
      return;
    }

    dispatch(newZoomLevel(newLevel));
  };
}

export function onScrollChange({x: newX, y: newY}) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    console.log('In onScrollChange', getState());
    const {
      browser: {
        scrollPosition: {x, y},
      },
    } = getState();

    if (newX === x && newY === y) {
      return;
    }

    dispatch(newScrollPosition({x: newX, y: newY}));
  };
}

export function triggerScrollDown() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    console.log('triggerScrollDown');
    pubsub.publish(SCROLL_DOWN);
  };
}

export function triggerScrollUp() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    pubsub.publish(SCROLL_UP);
  };
}
