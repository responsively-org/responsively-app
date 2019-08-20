// @flow
import {
  NEW_ADDRESS,
  NEW_ZOOM_LEVEL,
  NEW_SCROLL_POSITION,
} from '../actions/browser';
import type {Action} from './types';
import devices from '../constants/devices';
import type {Device} from '../constants/devices';

type ScrollPositionType = {
  x: number,
  y: number,
};

export type BrowserStateType = {
  devices: Array<Device>,
  address: string,
  zoomLevel: number,
  scrollPosition: ScrollPositionType,
};

export default function counter(
  state: BrowserStateType = {
    devices,
    address: 'https://www.joybird.com',
    zoomLevel: 0.5,
    scrollPosition: {x: 0, y: 0},
  },
  action: Action
) {
  switch (action.type) {
    case NEW_ADDRESS:
      return {...state, address: action.address};
    case NEW_ZOOM_LEVEL:
      return {...state, zoomLevel: action.zoomLevel};
    case NEW_SCROLL_POSITION:
      return {...state, scrollPosition: action.scrollPosition};
    default:
      return state;
  }
}
