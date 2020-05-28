// @flow
import type {Dispatch, BrowserStateType} from '../reducers/types';
import pubsub from 'pubsub.js';
import {
  SCROLL_DOWN,
  SCROLL_UP,
  NAVIGATION_BACK,
  NAVIGATION_FORWARD,
  NAVIGATION_RELOAD,
  SCREENSHOT_ALL_DEVICES,
  FLIP_ORIENTATION_ALL_DEVICES,
  ENABLE_INSPECTOR_ALL_DEVICES,
  RELOAD_CSS,
  DELETE_STORAGE,
} from '../constants/pubsubEvents';

export const NEW_ADDRESS = 'NEW_ADDRESS';
export const NEW_HOMEPAGE = 'NEW_HOMEPAGE';
export const NEW_ZOOM_LEVEL = 'NEW_ZOOM_LEVEL';
export const NEW_SCROLL_POSITION = 'NEW_SCROLL_POSITION';
export const NEW_NAVIGATOR_STATUS = 'NEW_NAVIGATOR_STATUS';
export const NEW_DRAWER_CONTENT = 'NEW_DRAWER_CONTENT';
export const NEW_PREVIEWER_CONFIG = 'NEW_PREVIEWER_CONFIG';
export const NEW_ACTIVE_DEVICES = 'NEW_ACTIVE_DEVICES';
export const NEW_ACTIVE_DEVICE = 'NEW_ACTIVE_DEVICE';
export const NEW_FILTERS = 'NEW_FILTERS';
export const NEW_USER_PREFERENCES = 'NEW_USER_PREFERENCES';

export function newAddress(address) {
  return {
    type: NEW_ADDRESS,
    address,
  };
}

export function newHomepage(homepage) {
  return {
    type: NEW_HOMEPAGE,
    homepage,
  };
}

export function newUserPreferences(userPreferences) {
  return {
    type: NEW_USER_PREFERENCES,
    userPreferences,
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

export function newNavigatorStatus(navigatorStatus) {
  return {
    type: NEW_NAVIGATOR_STATUS,
    navigatorStatus,
  };
}

export function newDrawerContent(drawer) {
  return {
    type: NEW_DRAWER_CONTENT,
    drawer,
  };
}

export function newPreviewerConfig(previewer) {
  return {
    type: NEW_PREVIEWER_CONFIG,
    previewer,
  };
}

export function newActiveDevices(devices) {
  return {
    type: NEW_ACTIVE_DEVICES,
    devices,
  };
}

export function newActiveDevice(device) {
  return {
    type: NEW_ACTIVE_DEVICE,
    device,
  };
}

export function newFilters(filters) {
  return {
    type: NEW_FILTERS,
    filters,
  };
}

export function onAddressChange(newURL, force) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {address},
    } = getState();

    if (newURL === address) {
      if (force) {
        pubsub.publish(NAVIGATION_RELOAD);
      }
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

export function updateNavigatorStatus({
  backEnabled: newBackEnabled,
  forwardEnabled: newForwardEnabled,
}) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {
        navigatorStatus: {backEnabled, forwardEnabled},
      },
    } = getState();

    if (
      newBackEnabled === backEnabled &&
      newForwardEnabled === forwardEnabled
    ) {
      return;
    }

    dispatch(
      newNavigatorStatus({
        backEnabled: newBackEnabled,
        forwardEnabled: newForwardEnabled,
      })
    );
  };
}

export function openDrawerAndSetContent(_newDrawerContent) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {
        drawer: {drawerContent, open},
      },
    } = getState();

    if (_newDrawerContent === drawerContent && open) {
      return;
    }

    dispatch(
      newDrawerContent({
        content: _newDrawerContent,
        open: true,
      })
    );
  };
}

export function changeDrawerOpenState(newOpenState) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {drawer},
    } = getState();

    if (newOpenState === drawer.open) {
      return;
    }

    dispatch(
      newDrawerContent({
        ...drawer,
        open: newOpenState,
      })
    );
  };
}

export function setPreviewLayout(newLayout) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {previewer},
    } = getState();

    if (previewer.layout === newLayout) {
      return;
    }

    dispatch(
      newPreviewerConfig({
        ...previewer,
        layout: newLayout,
      })
    );
  };
}

export function setActiveDevices(newDevices) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {devices},
    } = getState();

    if (false) {
      //TODO verify the devices list and return if the order of the devices didn;t change;
      return;
    }

    dispatch(newActiveDevices(newDevices));
  };
}

export function addNewDevice(newDevice) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {devices},
    } = getState();

    if (newDevice.added) {
      dispatch(newActiveDevices([...devices, newDevice]));
    }
  };
}

export function toggleFilter(filterField, value) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {filters},
    } = getState();
    if (!filters[filterField]) {
      filters[filterField] = [];
    }
    const index = filters[filterField].indexOf(value);
    if (index === -1) {
      filters[filterField].push(value);
    } else {
      filters[filterField].splice(index, 1);
    }
    dispatch(newFilters(filters));
  };
}

export function goToHomepage() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {homepage, address},
    } = getState();

    if (homepage === address) {
      return;
    }

    dispatch(newAddress(homepage));
  };
}

export function setCurrentAddressAsHomepage() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {homepage, address},
    } = getState();

    if (homepage === address) {
      return;
    }

    dispatch(newHomepage(address));
  };
}

export function onUserPreferencesChange(userPreferences) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    dispatch(newUserPreferences(userPreferences));
  };
}

export function triggerScrollDown() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    pubsub.publish(SCROLL_DOWN);
  };
}

export function screenshotAllDevices() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    pubsub.publish(SCREENSHOT_ALL_DEVICES, [{now: new Date()}]);
  };
}

export function flipOrientationAllDevices() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    pubsub.publish(FLIP_ORIENTATION_ALL_DEVICES);
  };
}

export function enableInpector() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    pubsub.publish(ENABLE_INSPECTOR_ALL_DEVICES);
  };
}

export function triggerScrollUp() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    pubsub.publish(SCROLL_UP);
  };
}

export function triggerNavigationBack() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    pubsub.publish(NAVIGATION_BACK);
  };
}

export function triggerNavigationForward() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    pubsub.publish(NAVIGATION_FORWARD);
  };
}

export function triggerNavigationReload(_, args) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const ignoreCache = (args || {}).ignoreCache;
    pubsub.publish(NAVIGATION_RELOAD, [{ignoreCache}]);
  };
}

export function deleteCookies() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    pubsub.publish(DELETE_STORAGE, [{storages: ['cookies']}]);
  };
}

export function deleteStorage() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    pubsub.publish(DELETE_STORAGE, [
      {
        storages: [
          'appcache',
          'filesystem',
          'indexdb',
          'localstorage',
          'shadercache',
          'websql',
          'serviceworkers',
          'cachestorage',
        ],
      },
    ]);
  };
}

export function reloadCSS() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    pubsub.publish(RELOAD_CSS);
  };
}
