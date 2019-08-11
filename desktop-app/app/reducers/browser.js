// @flow
import {NEW_ADDRESS} from '../actions/browser';
import type {Action} from './types';

export default function counter(state: Object = {}, action: Action) {
  switch (action.type) {
    case NEW_ADDRESS:
      return {...state, address: action.address};
    default:
      return state;
  }
}
