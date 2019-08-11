// @flow
import type {GetState, Dispatch} from '../reducers/types';

export const NEW_ADDRESS = 'NEW_ADDRESS';

export function newAddress(address) {
  return {
    type: NEW_ADDRESS,
    address,
  };
}

export function onAddressChange(newURL) {
  console.log('onAddressChange', newURL);
  return (dispatch: Dispatch, getState: GetState) => {
    const {address} = getState();

    console.log('newURL', newURL);

    if (newURL === address) {
      return;
    }

    dispatch(newAddress(newURL));
  };
}
