// @flow
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
  DELETE_CUSTOM_DEVICE
} from '../actions/browser'
import type {Action} from './types';
import getAllDevices from '../constants/devices';
import settings from 'electron-settings';
import type {Device} from '../constants/devices';
import {
  FLEXIGRID_LAYOUT,
  INDIVIDUAL_LAYOUT,
} from '../constants/previewerLayouts';
import {DEVICE_MANAGER} from '../constants/DrawerContents';
import {
  ACTIVE_DEVICES,
  USER_PREFERENCES,
  CUSTOM_DEVICES,
  BOOKMARKS,
} from '../constants/settingKeys';
import {isIfStatement} from 'typescript';
import {getHomepage, saveHomepage} from '../utils/navigatorUtils';
import {getWebsiteName} from '../components/WebView/screenshotUtil'

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

type DrawerType = {
  open: boolean,
  content: string,
};

type PreviewerType = {
  layout: string,
};

type UserPreferenceType = {
  disableSSLValidation: boolean,
  drawerState: boolean,
};

type FilterFieldType = FILTER_FIELDS.OS | FILTER_FIELDS.DEVICE_TYPE;

type FilterType = {[key: FilterFieldType]: Array<string>};

type BookmarksType = {
  title: string,
  url: string
}

export type BrowserStateType = {
  devices: Array<Device>,
  homepage: string,
  address: string,
  zoomLevel: number,
  scrollPosition: ScrollPositionType,
  navigatorStatus: NavigatorStatusType,
  drawer: DrawerType,
  previewer: PreviewerType,
  filters: FilterType,
  userPreferences: UserPreferenceType,
  bookmarks: BookmarksType
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
  let activeDeviceNames = settings.get(ACTIVE_DEVICES);
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
  return activeDevices;
}

function _getUserPreferences(): UserPreferenceType {
  return settings.get(USER_PREFERENCES) || {};
}

function _setUserPreferences(userPreferences) {
  settings.set(USER_PREFERENCES, userPreferences);
}

function _getBookmarks(): BookmarksType {
  return settings.get(BOOKMARKS) || [];
}

function _setBookmarks(bookmarks) {
  settings.set(BOOKMARKS, bookmarks);
}

export default function browser(
  state: BrowserStateType = {
    devices: _getActiveDevices(),
    homepage: getHomepage(),
    address: getHomepage(),
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
    bookmarks: _getBookmarks(),
  },
  action: Action
) {
  switch (action.type) {
    case NEW_ADDRESS:
      return {...state, address: action.address};
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
        existingCustomDevices.filter(device => device.id != action.device.id)
      );
      return {...state, allDevices: getAllDevices()};
    case NEW_FILTERS:
      return {...state, filters: action.filters};
    case NEW_USER_PREFERENCES:
      settings.set(USER_PREFERENCES, action.userPreferences);
      return {...state, userPreferences: action.userPreferences};
    case TOGGLE_BOOKMARK:
      let bookmarks = state.bookmarks
      const bookmark = {
        title: getWebsiteName(action.url),
        url: action.url
      }
      if (bookmarks.find(b => b.url === action.url)) {
        bookmarks = bookmarks.filter(b => b.url !== action.url)
      } else {
        bookmarks = [...bookmarks, bookmark]
      }
      _setBookmarks(bookmarks)
      return {...state, bookmarks}
    default:
      return state;
  }
}
