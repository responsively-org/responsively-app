// @flow
import {
  NEW_ADDRESS,
  NEW_ZOOM_LEVEL,
  NEW_SCROLL_POSITION,
  NEW_NAVIGATOR_STATUS,
  NEW_DRAWER_CONTENT,
  NEW_PREVIEWER_CONFIG,
} from '../actions/browser';
import type {Action} from './types';
import devices from '../constants/devices';
import type {Device} from '../constants/devices';
import {FLEXIGRID_LAYOUT} from '../constants/previewerLayouts';

type ScrollPositionType = {
  x: number,
  y: number,
};

type NavigatorStatusType = {
  backEnabled: boolean,
  forwardEnabled: boolean,
};

type DrawerType = {
  open: boolean,
  content: string,
};

type PreviewerType = {
  layout: string,
};

export type BrowserStateType = {
  devices: Array<Device>,
  address: string,
  zoomLevel: number,
  scrollPosition: ScrollPositionType,
  navigatorStatus: NavigatorStatusType,
  drawer: DrawerType,
  previewer: PreviewerType,
};

export default function counter(
  state: BrowserStateType = {
    devices,
    address: 'https://www.google.com',
    zoomLevel: 0.5,
    scrollPosition: {x: 0, y: 0},
    navigatorStatus: {backEnabled: false, forwardEnabled: false},
    drawer: {open: false},
    previewer: {layout: FLEXIGRID_LAYOUT},
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
    case NEW_NAVIGATOR_STATUS:
      return {...state, navigatorStatus: action.navigatorStatus};
    case NEW_DRAWER_CONTENT:
      return {...state, drawer: action.drawer};
    case NEW_PREVIEWER_CONFIG:
      return {...state, previewer: action.previewer};
    default:
      return state;
  }
}
