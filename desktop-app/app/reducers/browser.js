// @flow
import {
  NEW_ADDRESS,
  NEW_ZOOM_LEVEL,
  NEW_SCROLL_POSITION,
  NEW_NAVIGATOR_STATUS,
  NEW_DRAWER_CONTENT,
  NEW_PREVIEWER_CONFIG,
  NEW_ACTIVE_DEVICES,
  NEW_ACTIVE_DEVICE,
} from '../actions/browser';
import type {Action} from './types';
import devices from '../constants/devices';
import settings from 'electron-settings';
import type {Device} from '../constants/devices';
import {FLEXIGRID_LAYOUT} from '../constants/previewerLayouts';
import {DEVICE_MANAGER} from '../constants/DrawerContents';
import {ACTIVE_DEVICES} from '../constants/settingKeys';

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

console.log('devices.filter(device => devices.added)', devices);

let _activeDevices = null;

function _saveActiveDevices(devices) {
  settings.set(ACTIVE_DEVICES, devices);
  _activeDevices = devices;
}

function _getActiveDevices() {
  if (_activeDevices) {
    return _activeDevices;
  }
  let activeDevices = settings.get(ACTIVE_DEVICES);
  if (!activeDevices) {
    activeDevices = devices.filter(device => device.added);
    _saveActiveDevices(activeDevices);
  }
  return activeDevices;
}

export default function counter(
  state: BrowserStateType = {
    devices: _getActiveDevices(),
    address: 'https://www.google.com',
    zoomLevel: 0.5,
    scrollPosition: {x: 0, y: 0},
    navigatorStatus: {backEnabled: false, forwardEnabled: false},
    drawer: {open: false, content: DEVICE_MANAGER},
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
    case NEW_ACTIVE_DEVICES:
      _saveActiveDevices(action.devices);
      return {...state, devices: action.devices};
    case NEW_ACTIVE_DEVICE:
      const devices = [...state.devices, action.device];
      _saveActiveDevices(devices);
      return {...state, devices};
    default:
      return state;
  }
}
