// @flow
import {NEW_ADDRESS, NEW_ZOOM_LEVEL} from '../actions/browser';
import type {Action} from './types';
import devices from '../constants/devices';
import type {Device} from '../constants/devices';

export type BrowserStateType = {
  devices: Array<Device>,
  address: string,
  zoomLevel: number,
};

export default function counter(
  state: BrowserStateType = {devices, zoomLevel: 0.75},
  action: Action
) {
  switch (action.type) {
    case NEW_ADDRESS:
      return {...state, address: action.address};
    case NEW_ZOOM_LEVEL:
      return {...state, zoomLevel: action.zoomLevel};
    default:
      return state;
  }
}
