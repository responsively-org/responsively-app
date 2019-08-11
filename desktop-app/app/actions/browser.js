// @flow
import type {GetState, Dispatch} from '../reducers/types';

export const NEW_ADDRESS = 'NEW_ADDRESS';
export const NEW_ZOOM_LEVEL = 'NEW_ZOOM_LEVEL';

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

export function onAddressChange(newURL) {
  return (dispatch: Dispatch, getState: GetState) => {
    const {address} = getState();

    console.log('newURL', newURL);

    if (newURL === address) {
      return;
    }

    dispatch(newAddress(newURL));
  };
}

export function onZoomChange(newLevel) {
  return (dispatch: Dispatch, getState: GetState) => {
    const {zoomLevel} = getState();

    if (newLevel === zoomLevel) {
      return;
    }

    dispatch(newZoomLevel(newLevel));
  };
}
