// @flow
import type {Dispatch, BrowserStateType} from '../reducers/types';
import {ipcRenderer, remote} from 'electron';
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
  DISABLE_INSPECTOR_ALL_DEVICES,
  RELOAD_CSS,
  DELETE_STORAGE,
} from '../constants/pubsubEvents';
import {getBounds, getDefaultDevToolsWindowSize} from '../reducers/browser';
import {DEVTOOLS_MODES} from '../constants/previewerLayouts';

export const NEW_ADDRESS = 'NEW_ADDRESS';
export const NEW_DEV_TOOLS_CONFIG = 'NEW_DEV_TOOLS_CONFIG';
export const NEW_HOMEPAGE = 'NEW_HOMEPAGE';
export const NEW_ZOOM_LEVEL = 'NEW_ZOOM_LEVEL';
export const NEW_SCROLL_POSITION = 'NEW_SCROLL_POSITION';
export const NEW_NAVIGATOR_STATUS = 'NEW_NAVIGATOR_STATUS';
export const NEW_INSPECTOR_STATUS = 'NEW_INSPECTOR_STATUS';
export const NEW_DRAWER_CONTENT = 'NEW_DRAWER_CONTENT';
export const NEW_PREVIEWER_CONFIG = 'NEW_PREVIEWER_CONFIG';
export const NEW_ACTIVE_DEVICES = 'NEW_ACTIVE_DEVICES';
export const NEW_CUSTOM_DEVICE = 'NEW_CUSTOM_DEVICE';
export const DELETE_CUSTOM_DEVICE = 'DELETE_CUSTOM_DEVICE';
export const NEW_FILTERS = 'NEW_FILTERS';
export const NEW_USER_PREFERENCES = 'NEW_USER_PREFERENCES';
export const NEW_WINDOW_SIZE = 'NEW_WINDOW_SIZE';

export function newAddress(address) {
  return {
    type: NEW_ADDRESS,
    address,
  };
}

export function newWindowSize(size) {
  return {
    type: NEW_WINDOW_SIZE,
    size,
  };
}

export function newDevToolsConfig(config) {
  return {
    type: NEW_DEV_TOOLS_CONFIG,
    config,
  };
}

export function newHomepage(homepage) {
  return {
    type: NEW_HOMEPAGE,
    homepage,
  };
}

export function newInspectorState(status) {
  return {
    type: NEW_INSPECTOR_STATUS,
    status,
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

export function newCustomDevice(device) {
  return {
    type: NEW_CUSTOM_DEVICE,
    device,
  };
}

export function deleteCustomDevice(device) {
  return {
    type: DELETE_CUSTOM_DEVICE,
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

    const isHashDiff = isHashOnlyChange(newURL, address);

    if (isHashDiff) {
      return;
    }

    dispatch(newAddress(newURL));
  };
}

function isHashOnlyChange(newURL, oldURL) {
  if (!newURL || !oldURL) {
    return false;
  }
  let diff = newURL.replace(oldURL, '').trim();
  if (diff.startsWith('/')) {
    diff = diff.substring(1);
  }

  return diff.startsWith('#');
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

export function addCustomDevice(newDevice) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {devices},
    } = getState();

    dispatch(newCustomDevice(newDevice));

    if (newDevice.added) {
      dispatch(newActiveDevices([...devices, newDevice]));
    }
  };
}

export function deleteDevice(device) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    dispatch(deleteCustomDevice(device));
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

export function onDevToolsModeChange(_mode) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {devToolsConfig, windowSize},
    } = getState();

    const {mode} = devToolsConfig;

    if (mode === _mode) {
      return;
    }

    if (_mode === DEVTOOLS_MODES.UNDOCKED) {
      ipcRenderer.send('close-devtools', devToolsConfig);
      const newConfig = {...devToolsConfig, mode: _mode};
      ipcRenderer.send('open-devtools', newConfig);
      return dispatch(newDevToolsConfig(newConfig));
    }

    const size = getDefaultDevToolsWindowSize(_mode, windowSize);
    const newBounds = getBounds(_mode, size, windowSize);
    ipcRenderer.send('resize-devtools', {bounds: newBounds});

    dispatch(
      newDevToolsConfig({
        ...devToolsConfig,
        size,
        bounds: newBounds,
        mode: _mode,
      })
    );
  };
}

export function onWindowResize(size) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {
        windowSize: {width, height},
        devToolsConfig,
      },
    } = getState();

    if (width === size.width && height === size.height) {
      return;
    }

    dispatch(newWindowSize(size));
    const devToolsSize = getDefaultDevToolsWindowSize(
      devToolsConfig.mode,
      size
    );
    const newBounds = getBounds(devToolsConfig.mode, devToolsSize, size);
    ipcRenderer.send('resize-devtools', {
      bounds: newBounds,
    });
    dispatch(
      newDevToolsConfig({
        ...devToolsConfig,
        size: devToolsSize,
        bounds: newBounds,
      })
    );
  };
}

export function onDevToolsResize(size) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {devToolsConfig, windowSize},
    } = getState();

    const {size: devToolsSize, bounds, mode} = devToolsConfig;

    if (
      devToolsSize.width === size.width &&
      devToolsSize.height === size.height
    ) {
      return;
    }
    const newBounds = getBounds(mode, size, windowSize);
    ipcRenderer.send('resize-devtools', {
      bounds: newBounds,
    });

    dispatch(newDevToolsConfig({...devToolsConfig, size, bounds: newBounds}));
  };
}

export function onDevToolsOpen(newDeviceId, newWebViewId) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {devToolsConfig},
    } = getState();

    const {open, activeDevTools, bounds, mode} = devToolsConfig;

    if (
      open &&
      !!activeDevTools.find(({deviceId}) => deviceId === newDeviceId)
    ) {
      return;
    }

    let newActiveDevices = [...activeDevTools];

    if (open && activeDevTools[0] && mode !== DEVTOOLS_MODES.UNDOCKED) {
      activeDevTools.forEach(({webViewId}) => {
        ipcRenderer.send('close-devtools', {webViewId});
        newActiveDevices = newActiveDevices.filter(
          ({webViewId: _webViewId}) => webViewId !== _webViewId
        );
      });
    }

    ipcRenderer.send('open-devtools', {bounds, mode, webViewId: newWebViewId});

    const newData = {
      ...devToolsConfig,
      open: true,
      activeDevTools: [
        ...newActiveDevices,
        {deviceId: newDeviceId, webViewId: newWebViewId},
      ],
    };

    dispatch(newDevToolsConfig(newData));
  };
}

export function onDevToolsClose(devToolsInfo, closeAll) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {devToolsConfig},
    } = getState();

    const {open, activeDevTools} = devToolsConfig;

    if (!open) {
      return;
    }

    let devToolsToClose = [];

    if (closeAll) {
      devToolsToClose = [...activeDevTools];
    } else {
      devToolsToClose = [devToolsInfo];
    }

    let newActiveDevTools = [...activeDevTools];

    devToolsToClose.forEach(({webViewId}) => {
      ipcRenderer.send('close-devtools', {webViewId});
      newActiveDevTools = newActiveDevTools.filter(
        ({webViewId: _webViewId}) => _webViewId != webViewId
      );
    });

    dispatch(
      newDevToolsConfig({
        ...devToolsConfig,
        open: newActiveDevTools.length > 0,
        activeDevTools: newActiveDevTools,
      })
    );
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

export function toggleInspector() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {isInspecting},
    } = getState();

    pubsub.publish(
      !isInspecting
        ? ENABLE_INSPECTOR_ALL_DEVICES
        : DISABLE_INSPECTOR_ALL_DEVICES
    );

    dispatch(newInspectorState(!isInspecting));
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
    const ignoreCache = (args || {}).ignoreCache || false;
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
