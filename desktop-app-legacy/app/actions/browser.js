// @flow
import {ipcRenderer, remote} from 'electron';
import pubsub from 'pubsub.js';
import type {Dispatch, BrowserStateType} from '../reducers/types';
import {
  SCROLL_DOWN,
  SCROLL_UP,
  NAVIGATION_BACK,
  NAVIGATION_FORWARD,
  NAVIGATION_RELOAD,
  SCREENSHOT_ALL_DEVICES,
  FLIP_ORIENTATION_ALL_DEVICES,
  TOGGLE_DEVICE_MUTED_STATE,
  TOGGLE_EVENT_MIRRORING_ALL_DEVICES,
  RELOAD_CSS,
  DELETE_STORAGE,
  ADDRESS_CHANGE,
  STOP_LOADING,
  TOGGLE_DEVICE_DESIGN_MODE_STATE,
  PAGE_NAVIGATOR_CHANGED,
} from '../constants/pubsubEvents';
import {getBounds, getDefaultDevToolsWindowSize} from '../reducers/browser';
import {DEVTOOLS_MODES} from '../constants/previewerLayouts';
import {normalizeZoomLevel} from '../utils/browserUtils';

export const NEW_ADDRESS = 'NEW_ADDRESS';
export const NEW_PAGE_META_FIELD = 'NEW_PAGE_META_FIELD';
export const NEW_DEV_TOOLS_CONFIG = 'NEW_DEV_TOOLS_CONFIG';
export const NEW_HOMEPAGE = 'NEW_HOMEPAGE';
export const NEW_ZOOM_LEVEL = 'NEW_ZOOM_LEVEL';
export const NEW_SCROLL_POSITION = 'NEW_SCROLL_POSITION';
export const NEW_NAVIGATOR_STATUS = 'NEW_NAVIGATOR_STATUS';
export const NEW_INSPECTOR_STATUS = 'NEW_INSPECTOR_STATUS';
export const NEW_CSS_EDITOR_STATUS = 'NEW_CSS_EDITOR_STATUS';
export const NEW_CSS_EDITOR_POSITION = 'NEW_CSS_EDITOR_POSITION';
export const NEW_CSS_EDITOR_CONTENT = 'NEW_CSS_EDITOR_CONTENT';
export const NEW_DRAWER_CONTENT = 'NEW_DRAWER_CONTENT';
export const NEW_PREVIEWER_CONFIG = 'NEW_PREVIEWER_CONFIG';
export const NEW_ACTIVE_DEVICES = 'NEW_ACTIVE_DEVICES';
export const NEW_CUSTOM_DEVICE = 'NEW_CUSTOM_DEVICE';
export const LOAD_CUSTOM_DEVICES = 'LOAD_CUSTOM_DEVICES';
export const DELETE_CUSTOM_DEVICE = 'DELETE_CUSTOM_DEVICE';
export const NEW_FILTERS = 'NEW_FILTERS';
export const NEW_USER_PREFERENCES = 'NEW_USER_PREFERENCES';
export const TOGGLE_BOOKMARK = 'TOGGLE_BOOKMARK';
export const NEW_WINDOW_SIZE = 'NEW_WINDOW_SIZE';
export const DEVICE_LOADING = 'DEVICE_LOADING';
export const NEW_FOCUSED_DEVICE = 'NEW_FOCUSED_DEVICE';
export const TOGGLE_ALL_DEVICES_MUTED = 'TOGGLE_ALL_DEVICES_MUTED';
export const TOGGLE_DEVICE_MUTED = 'TOGGLE_DEVICE_MUTED';
export const NEW_THEME = 'NEW_THEME';
export const TOGGLE_ALL_DEVICES_DESIGN_MODE = 'TOGGLE_ALL_DEVICES_DESIGN_MODE';
export const TOGGLE_DEVICE_DESIGN_MODE = 'TOGGLE_DEVICE_DESIGN_MODE';
export const SET_HEADER_VISIBILITY = 'SET_HEADER_VISIBILITY';
export const SET_LEFT_PANE_VISIBILITY = 'SET_LEFT_PANE_VISIBILITY';
export const SET_HOVERED_LINK = 'SET_HOVERED_LINK';
export const SET_STARTUP_PAGE = 'SET_STARTUP_PAGE';
export const UPDATE_PAGE_NAVIGATOR = 'UPDATE_PAGE_NAVIGATOR';
export const TOGGLE_PAGE_NAVIGATOR = 'TOGGLE_PAGE_NAVIGATOR';

export function newAddress(address) {
  return {
    type: NEW_ADDRESS,
    address,
  };
}

export function newPageMetaField(name, value) {
  return {
    type: NEW_PAGE_META_FIELD,
    name,
    value,
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

export function newCSSEditorState(status) {
  return {
    type: NEW_CSS_EDITOR_STATUS,
    status,
  };
}

export function newCSSEditorPosition(position) {
  return {
    type: NEW_CSS_EDITOR_POSITION,
    position,
  };
}

export function newCSSEditorContent(content) {
  return {
    type: NEW_CSS_EDITOR_CONTENT,
    content,
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

export function newFocusedDevice(previewer) {
  return {
    type: NEW_FOCUSED_DEVICE,
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

export function loadCustomDevices(devices) {
  return {
    type: LOAD_CUSTOM_DEVICES,
    devices,
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

export function newDeviceLoading(device) {
  return {
    type: DEVICE_LOADING,
    device,
  };
}

export function toggleAllDevicesMuted(allDevicesMuted) {
  return {
    type: TOGGLE_ALL_DEVICES_MUTED,
    allDevicesMuted,
  };
}

export function toggleDeviceMuted(deviceId, isMuted) {
  return {
    type: TOGGLE_DEVICE_MUTED,
    deviceId,
    isMuted,
  };
}

export function toggleAllDevicesDesignMode() {
  return {
    type: TOGGLE_ALL_DEVICES_DESIGN_MODE,
  };
}

export function toggleDeviceDesignMode(deviceId) {
  return {
    type: TOGGLE_DEVICE_DESIGN_MODE,
    deviceId,
  };
}

export function onAddressChange(newURL, force) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {address},
    } = getState();

    if (newURL === address) {
      if (force) {
        pubsub.publish(NAVIGATION_RELOAD, [{ignoreCache: false}]);
      }
      return;
    }

    dispatch(newAddress(newURL));
    pubsub.publish(ADDRESS_CHANGE, [{address: newURL, force: false}]);
  };
}

export function onPageMetaFieldUpdate(name, value) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    dispatch(newPageMetaField(name, value));
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
    const normalizedZoomLevel = normalizeZoomLevel(newLevel);

    if (normalizedZoomLevel === zoomLevel) {
      return;
    }

    dispatch(newZoomLevel(normalizedZoomLevel));
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

export function setFocusedDevice(focusedDeviceId) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {previewer},
    } = getState();

    if (previewer.focusedDeviceId === focusedDeviceId) {
      return;
    }

    dispatch(
      newFocusedDevice({
        ...previewer,
        focusedDeviceId,
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
      // TODO verify the devices list and return if the order of the devices didn;t change;
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
    pubsub.publish(ADDRESS_CHANGE, [{address: homepage, force: true}]);
  };
}

export function gotoUrl(url) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {address},
    } = getState();

    if (url === address) {
      return;
    }

    dispatch(newAddress(url));
  };
}

export function onDevToolsModeChange(newMode) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {devToolsConfig, windowSize},
    } = getState();

    const {mode, activeDevTools, open} = devToolsConfig;

    if (mode === newMode) {
      return;
    }

    let newActiveDevTools = [...activeDevTools];
    let newOpen = open;

    if (
      newMode === DEVTOOLS_MODES.UNDOCKED ||
      mode === DEVTOOLS_MODES.UNDOCKED
    ) {
      dispatch(onDevToolsClose(null, true));
      if (newActiveDevTools.length > 0) {
        newActiveDevTools = [newActiveDevTools[0]];
        newOpen = true;
      } else {
        newActiveDevTools = [];
        newOpen = false;
      }
    }

    let newConfig = {
      ...devToolsConfig,
      activeDevTools: newActiveDevTools,
      mode: newMode,
      open: newOpen,
    };
    if (newMode !== DEVTOOLS_MODES.UNDOCKED) {
      const size = getDefaultDevToolsWindowSize(newMode, windowSize);
      const bounds = getBounds(newMode, size, windowSize);
      newConfig = {
        ...newConfig,
        size,
        bounds,
      };
    }

    if (
      newMode === DEVTOOLS_MODES.UNDOCKED ||
      mode === DEVTOOLS_MODES.UNDOCKED
    ) {
      newConfig.activeDevTools.forEach(({webViewId, deviceId}) =>
        setTimeout(() => {
          dispatch(onDevToolsOpen(deviceId, webViewId, true));
        })
      );
    } else {
      ipcRenderer.send('resize-devtools', {bounds: newConfig.bounds});
    }

    dispatch(newDevToolsConfig(newConfig));
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

export function onDevToolsOpen(newDeviceId, newWebViewId, force) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {devToolsConfig},
    } = getState();

    const {open, activeDevTools, bounds, mode} = devToolsConfig;

    if (
      open &&
      !!activeDevTools.find(({deviceId}) => deviceId === newDeviceId)
    ) {
      if (force) {
        ipcRenderer.send('open-devtools', {
          bounds,
          mode,
          webViewId: newWebViewId,
        });
      }
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
        ({webViewId: _webViewId}) => _webViewId !== webViewId
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

export function downloadPreferences(url) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    ipcRenderer.send('download-preferences', {url});
  };
}

export function uploadPreferences() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    remote.dialog
      .showOpenDialog({
        title: 'Select user configuration file',
        buttonLabel: 'Upload File',
        filters: [
          {
            name: 'Json file',
            extensions: ['json'],
          },
        ],
        properties: ['openFile'],
      })
      .then(async file => {
        if (!file.canceled) {
          const response = await (await fetch(file.filePaths[0])).json();
          const preferencesObj = response;
          dispatch(newActiveDevices(preferencesObj.devices));
          dispatch(loadCustomDevices(preferencesObj.customDevices));
          dispatch(newUserPreferences(preferencesObj.userPreferences));
          dispatch(setTheme(preferencesObj.userPreferences.theme));
        }
      });
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

export function toggleEventMirroringAllDevices(status: boolean) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    pubsub.publish(TOGGLE_EVENT_MIRRORING_ALL_DEVICES, [{status}]);
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

export function onAllDevicesMutedChange() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {allDevicesMuted},
    } = getState();
    const next = !allDevicesMuted;
    pubsub.publish(TOGGLE_DEVICE_MUTED_STATE, [{muted: next}]);
    dispatch(toggleAllDevicesMuted(next));
  };
}

export function onDeviceMutedChange(deviceId, isMuted) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    dispatch(toggleDeviceMuted(deviceId, isMuted));
  };
}

export function onToggleAllDeviceDesignMode() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {allDevicesInDesignMode},
    } = getState();
    const next = !allDevicesInDesignMode;
    pubsub.publish(TOGGLE_DEVICE_DESIGN_MODE_STATE, [{designMode: next}]);
    dispatch(toggleAllDevicesDesignMode());
  };
}

export function onToggleDeviceDesignMode(deviceId) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    dispatch(toggleDeviceDesignMode(deviceId));
  };
}

export function toggleInspector() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {isInspecting},
    } = getState();

    dispatch(newInspectorState(!isInspecting));
  };
}

export function toggleCSSEditor() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {
        CSSEditor: {isOpen},
      },
    } = getState();

    dispatch(newCSSEditorState(!isOpen));
  };
}

export function changeCSSEditorPosition(newPosition) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {
        CSSEditor: {position},
      },
    } = getState();

    if (position === newPosition) {
      return;
    }

    dispatch(newCSSEditorPosition(newPosition));
  };
}

export function onCSSEditorContentChange(newContent) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {
        CSSEditor: {content},
      },
    } = getState();

    if (content === newContent) {
      return;
    }

    dispatch(newCSSEditorContent(newContent));
  };
}

export function deviceLoadingChange(deviceInfo) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    dispatch(newDeviceLoading(deviceInfo));
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

export function triggerStopLoading(_, args) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    pubsub.publish(STOP_LOADING);
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

export function setTheme(theme) {
  return {
    type: NEW_THEME,
    theme,
  };
}

/**
 * Shows/Hides the top control pane.
 * @param {boolean} isVisible Shows the top pane when true and hides when false.
 */
export function setHeaderVisibility(isVisible: boolean) {
  return {
    type: SET_HEADER_VISIBILITY,
    isVisible,
  };
}

/**
 * Shows/Hides the left control pane.
 * @param {boolean} isVisible Shows the left control pane when true and hides when false.
 */
export function setLeftPaneVisibility(isVisible: boolean) {
  return {
    type: SET_LEFT_PANE_VISIBILITY,
    isVisible,
  };
}

/**
 * Sets the url being hovered in a webview. When empty, it means that no anchor element is being hovered.
 *
 * @param {string} url URL from the anchor tag that is being hovered. Pass empty string to indicate no links are being hovered.
 * @returns Redux action with type as SET_HOVERED_LINK
 */
export function setHoveredLink(url) {
  return {
    type: SET_HOVERED_LINK,
    url,
  };
}

export function setStartupPage(value: 'BLANK' | 'HOME') {
  return {
    type: SET_STARTUP_PAGE,
    value,
  };
}

export function changeStartupPage(value: 'BLANK' | 'HOME') {
  return (dispatch: Dispatch, getState: RootStateType) => {
    dispatch(setStartupPage(value));
  };
}

export function updatePageNavigator(selector, index) {
  return {
    type: UPDATE_PAGE_NAVIGATOR,
    selector,
    index,
  };
}

export function resetPageNavigator() {
  return (dispatch: Dispatch, getState: RootStateType) => {
    const {
      browser: {
        pageNavigator: {selector, index},
      },
    } = getState();
    if (selector == null && index == null) return;
    dispatch(updatePageNavigator(null, null));
  };
}

export function navigateToNextSelector(selector) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    if ((selector || '').length === 0) return;

    const {
      browser: {pageNavigator},
    } = getState();

    let index = pageNavigator.index;

    if (pageNavigator.selector !== selector || index == null) index = -1;

    pubsub.publish(PAGE_NAVIGATOR_CHANGED, [
      {selector, index: (index || 0) + 1},
    ]);
    dispatch(updatePageNavigator(selector, (index || 0) + 1));
  };
}

export function navigateToPrevSelector(selector) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    if ((selector || '').length === 0) return;

    const {
      browser: {pageNavigator},
    } = getState();

    let index = pageNavigator.index;

    if (pageNavigator.selector !== selector || index == null) index = 0;

    pubsub.publish(PAGE_NAVIGATOR_CHANGED, [
      {selector, index: (index || 0) - 1},
    ]);
    dispatch(updatePageNavigator(selector, (index || 0) - 1));
  };
}

export function setPageNavigatorActive(active) {
  return {
    type: TOGGLE_PAGE_NAVIGATOR,
    active,
  };
}

export function onChangePageNavigatorActive(active) {
  return (dispatch: Dispatch, getState: RootStateType) => {
    pubsub.publish(TOGGLE_EVENT_MIRRORING_ALL_DEVICES, [{status: !active}]);
    dispatch(setPageNavigatorActive(active));
  };
}
