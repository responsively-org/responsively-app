// @flow
import {ipcRenderer, remote} from 'electron';
import settings from 'electron-settings';
import {isIfStatement} from 'typescript';
import console from 'electron-timber';
import trimStart from 'lodash/trimStart';
import {
  NEW_ADDRESS,
  NEW_ZOOM_LEVEL,
  NEW_SCROLL_POSITION,
  NEW_NAVIGATOR_STATUS,
  NEW_DRAWER_CONTENT,
  NEW_PREVIEWER_CONFIG,
  NEW_ACTIVE_DEVICES,
  NEW_CUSTOM_DEVICE,
  NEW_FILTERS,
  NEW_HOMEPAGE,
  NEW_USER_PREFERENCES,
  DELETE_CUSTOM_DEVICE,
  TOGGLE_BOOKMARK,
  NEW_DEV_TOOLS_CONFIG,
  NEW_INSPECTOR_STATUS,
  NEW_WINDOW_SIZE,
  DEVICE_LOADING,
  NEW_FOCUSED_DEVICE,
  NEW_PAGE_META_FIELD,
  TOGGLE_ALL_DEVICES_MUTED,
  TOGGLE_DEVICE_MUTED,
} from '../actions/browser';
import type {Action} from './types';
import getAllDevices from '../constants/devices';
import type {Device} from '../constants/devices';
import {
  FLEXIGRID_LAYOUT,
  INDIVIDUAL_LAYOUT,
  DEVTOOLS_MODES,
} from '../constants/previewerLayouts';
import {DEVICE_MANAGER} from '../constants/DrawerContents';
import {
  ACTIVE_DEVICES,
  USER_PREFERENCES,
  CUSTOM_DEVICES,
} from '../constants/settingKeys';
import {
  getHomepage,
  getLastOpenedAddress,
  saveHomepage,
  saveLastOpenedAddress,
} from '../utils/navigatorUtils';

export const FILTER_FIELDS = {
  OS: 'OS',
  DEVICE_TYPE: 'DEVICE_TYPE',
};

type ScrollPositionType = {
  x: number,
  y: number,
};

type NavigatorStatusType = {
  backEnabled: boolean,
  forwardEnabled: boolean,
};

type WindowSizeType = {
  width: number,
  height: number,
};

type DevToolsOpenModeType = DEVTOOLS_MODES.BOTTOM | DEVTOOLS_MODES.RIGHT;

type WindowBoundsType = {
  x: number,
  y: number,
  width: number,
  height: number,
};

type DevToolInfo = {
  deviceId: string,
  webViewId: number,
};

type DevToolsConfigType = {
  size: WindowSizeType,
  open: Boolean,
  activeDevTools: Array<DevToolInfo>,
  mode: DevToolsOpenModeType,
  bounds: WindowBoundsType,
};

type DrawerType = {
  open: boolean,
  content: string,
};

type PreviewerType = {
  layout: string,
  previousLayout: string,
  focusedDeviceId: string,
};

type PageMetaType = {
  title: String,
  favicons: Array<string>,
};

type UserPreferenceType = {
  disableSSLValidation: boolean,
  reopenLastAddress: boolean,
  drawerState: boolean,
  devToolsOpenMode: DevToolsOpenModeType,
  deviceOutlineStyle: string,
};

type FilterFieldType = FILTER_FIELDS.OS | FILTER_FIELDS.DEVICE_TYPE;

type FilterType = {[key: FilterFieldType]: Array<string>};

export type BrowserStateType = {
  devices: Array<Device>,
  homepage: string,
  address: string,
  currentPageMeta: PageMetaType,
  zoomLevel: number,
  scrollPosition: ScrollPositionType,
  navigatorStatus: NavigatorStatusType,
  drawer: DrawerType,
  previewer: PreviewerType,
  filters: FilterType,
  userPreferences: UserPreferenceType,
  bookmarks: BookmarksType,
  devToolsConfig: DevToolsConfigType,
  isInspecting: boolean,
  windowSize: WindowSizeType,
  allDevicesMuted: boolean,
};

let _activeDevices = null;

function _saveActiveDevices(devices) {
  settings.set(
    ACTIVE_DEVICES,
    devices.map(device => device.name)
  );
  _activeDevices = devices;
}

function _getActiveDevices() {
  if (_activeDevices) {
    return _activeDevices;
  }
  const activeDeviceNames = settings.get(ACTIVE_DEVICES);
  let activeDevices = null;
  if (activeDeviceNames && activeDeviceNames.length) {
    activeDevices = activeDeviceNames
      .map(name => getAllDevices().find(device => device.name === name))
      .filter(Boolean);
  }
  if (!activeDevices || !activeDevices.length) {
    activeDevices = getAllDevices().filter(device => device.added);
    _saveActiveDevices(activeDevices);
  }

  if (activeDevices) {
    activeDevices.forEach(device => {
      device.loading = false;
      device.isMuted = false;
    });
  }
  return activeDevices;
}

function _getUserPreferences(): UserPreferenceType {
  return settings.get(USER_PREFERENCES) || {};
}

function _setUserPreferences(userPreferences) {
  settings.set(USER_PREFERENCES, userPreferences);
}

export function getBounds(mode, _size, windowSize) {
  const size = _size || getDefaultDevToolsWindowSize(mode, windowSize);
  const {width, height} = windowSize;
  if (mode === DEVTOOLS_MODES.RIGHT) {
    const viewWidth = size.width;
    const viewHeight = size.height - 64 - 10;
    return {
      x: width - viewWidth,
      y: height - viewHeight,
      width: viewWidth,
      height: viewHeight,
    };
  }
  const viewHeight = size.height - 20;
  return {
    x: 0,
    y: height - viewHeight,
    width,
    height: viewHeight,
  };
}

export function getDefaultDevToolsWindowSize(mode, windowSize) {
  const {width, height} = windowSize;
  if (mode === DEVTOOLS_MODES.RIGHT) {
    return {width: Math.round(width * 0.25), height};
  }
  return {width, height: Math.round(height * 0.33)};
}

function getWindowSize() {
  return remote.screen.getPrimaryDisplay().workAreaSize;
}

function _getUserPreferencesDevToolsMode() {
  return _getUserPreferences().devToolsOpenMode || DEVTOOLS_MODES.BOTTOM;
}

function _updateFileWatcher(newURL) {
  if (
    newURL.startsWith('file://') &&
    (newURL.endsWith('.html') || newURL.endsWith('.htm'))
  )
    ipcRenderer.send('start-watching-file', {
      path: newURL,
    });
  else ipcRenderer.send('stop-watcher');
}

export default function browser(
  state: BrowserStateType = {
    devices: _getActiveDevices(),
    homepage: getHomepage(),
    address: _getUserPreferences().reopenLastAddress
      ? getLastOpenedAddress()
      : getHomepage(),
    currentPageMeta: {},
    zoomLevel: 0.6,
    previousZoomLevel: null,
    scrollPosition: {x: 0, y: 0},
    navigatorStatus: {backEnabled: false, forwardEnabled: false},
    drawer: {
      open:
        _getUserPreferences().drawerState === null
          ? true
          : _getUserPreferences().drawerState,
      content: DEVICE_MANAGER,
    },
    previewer: {layout: FLEXIGRID_LAYOUT},
    filters: {[FILTER_FIELDS.OS]: [], [FILTER_FIELDS.DEVICE_TYPE]: []},
    userPreferences: _getUserPreferences(),
    allDevices: getAllDevices(),
    devToolsConfig: {
      size: getDefaultDevToolsWindowSize(
        _getUserPreferencesDevToolsMode(),
        getWindowSize()
      ),
      open: false,
      mode: _getUserPreferencesDevToolsMode(),
      activeDevTools: [],
      bounds: getBounds(
        _getUserPreferencesDevToolsMode(),
        null,
        getWindowSize()
      ),
    },
    isInspecting: false,
    windowSize: getWindowSize(),
    allDevicesMuted: false,
  },
  action: Action
) {
  switch (action.type) {
    case NEW_ADDRESS:
      saveLastOpenedAddress(action.address);
      _updateFileWatcher(action.address);
      return {...state, address: action.address, currentPageMeta: {}};
    case NEW_PAGE_META_FIELD:
      return {
        ...state,
        currentPageMeta: {
          ...state.currentPageMeta,
          [action.name]: action.value,
        },
      };
    case NEW_HOMEPAGE:
      const {homepage} = action;
      saveHomepage(homepage);
      return {...state, homepage};
    case NEW_ZOOM_LEVEL:
      return {...state, zoomLevel: action.zoomLevel};
    case NEW_SCROLL_POSITION:
      return {...state, scrollPosition: action.scrollPosition};
    case NEW_NAVIGATOR_STATUS:
      return {...state, navigatorStatus: action.navigatorStatus};
    case NEW_DRAWER_CONTENT:
      _setUserPreferences({
        ...state.userPreferences,
        drawerState: action.drawer.open,
      });
      return {...state, drawer: action.drawer};
    case NEW_PREVIEWER_CONFIG:
      const updateObject = {previewer: action.previewer};
      updateObject.previewer.previousLayout = state.previewer.layout;

      if (
        state.previewer.layout !== INDIVIDUAL_LAYOUT &&
        action.previewer.layout === INDIVIDUAL_LAYOUT
      ) {
        updateObject.zoomLevel = 1;
        updateObject.previousZoomLevel = state.zoomLevel;
      }
      if (
        state.previewer.layout === INDIVIDUAL_LAYOUT &&
        action.previewer.layout !== INDIVIDUAL_LAYOUT
      ) {
        updateObject.zoomLevel = state.previousZoomLevel;
        updateObject.previousZoomLevel = null;
      }
      return {...state, ...updateObject};
    case NEW_FOCUSED_DEVICE:
      return {...state, previewer: action.previewer};
    case NEW_ACTIVE_DEVICES:
      _saveActiveDevices(action.devices);
      return {...state, devices: action.devices};
    case NEW_CUSTOM_DEVICE:
      const existingDevices = settings.get(CUSTOM_DEVICES) || [];
      settings.set(CUSTOM_DEVICES, [action.device, ...existingDevices]);
      return {...state, allDevices: getAllDevices()};
    case DELETE_CUSTOM_DEVICE:
      const existingCustomDevices = settings.get(CUSTOM_DEVICES) || [];
      settings.set(
        CUSTOM_DEVICES,
        existingCustomDevices.filter(device => device.id !== action.device.id)
      );
      return {...state, allDevices: getAllDevices()};
    case NEW_FILTERS:
      return {...state, filters: action.filters};
    case NEW_USER_PREFERENCES:
      _setUserPreferences(action.userPreferences);
      return {...state, userPreferences: action.userPreferences};
    case NEW_DEV_TOOLS_CONFIG:
      const newState = {...state, devToolsConfig: action.config};
      if (state.devToolsConfig.mode !== action.config.mode) {
        const newUserPreferences = {
          ...state.userPreferences,
          devToolsOpenMode: action.config.mode,
        };
        _setUserPreferences(newUserPreferences);
        newState.userPreferences = newUserPreferences;
      }
      return newState;
    case NEW_INSPECTOR_STATUS:
      return {...state, isInspecting: action.status};
    case NEW_WINDOW_SIZE:
      return {...state, windowSize: action.size};
    case DEVICE_LOADING:
      const newDevicesList = state.devices.map(device =>
        device.id === action.device.id
          ? {...device, loading: action.device.loading}
          : device
      );
      return {...state, devices: newDevicesList};
    case TOGGLE_ALL_DEVICES_MUTED:
      const updatedDevices = state.devices;
      updatedDevices.forEach(d => (d.isMuted = action.allDevicesMuted));
      return {
        ...state,
        allDevicesMuted: action.allDevicesMuted,
        devices: updatedDevices,
      };
    case TOGGLE_DEVICE_MUTED:
      const updatedDevice = state.devices.find(x => x.id === action.deviceId);
      if (updatedDevice == null) return {...state};
      updatedDevice.isMuted = action.isMuted;
      return {
        ...state,
        allDevicesMuted: state.devices.every(x => x.isMuted),
        devices: [...state.devices],
      };
    default:
      return state;
  }
}
