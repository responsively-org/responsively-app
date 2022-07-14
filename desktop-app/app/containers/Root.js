import React, {Component} from 'react';
import {Provider} from 'react-redux';
import log from 'electron-log';
import {makeStyles} from '@material-ui/core/styles';
import {ThemeProvider} from '@material-ui/styles';
import {remote} from 'electron';
import AppContent from '../AppContent';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  registerShortcut,
  clearAllShortcuts,
  unregisterShortcut,
} from '../shortcut-manager/renderer-shortcut-manager';
import {
  onZoomChange,
  triggerScrollUp,
  triggerScrollDown,
  screenshotAllDevices,
  flipOrientationAllDevices,
  toggleInspector,
  goToHomepage,
  triggerNavigationBack,
  triggerNavigationForward,
  deleteCookies,
  deleteStorage,
  triggerNavigationReload,
} from '../actions/browser';
import {toggleBookmarkUrl} from '../actions/bookmarks';
import pubsub from 'pubsub.js';
import {PROXY_AUTH_ERROR} from '../constants/pubsubEvents';
import useCreateTheme from '../components/useCreateTheme';
import {DEFAULT_ZOOM_LEVEL} from '../constants';

function App() {
  const theme = useCreateTheme();

  return (
    <ThemeProvider theme={theme}>
      {process.env.NODE_ENV !== 'development' ? (
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      ) : (
        <AppContent />
      )}
    </ThemeProvider>
  );
}

export default class Root extends Component {
  componentDidMount() {
    this.registerAllShortcuts();
    remote.session.defaultSession.webRequest.onErrorOccurred(details => {
      if (
        this.props.store.getState().browser.address === details.url &&
        details.statusCode === 407
      )
        pubsub.publish(PROXY_AUTH_ERROR);
    });
  }

  componentWillUnmount() {
    clearAllShortcuts();
    document.removeEventListener('wheel', this.onWheel);
    remote.session.defaultSession.webRequest.onErrorOccurred(null);
  }

  registerAllShortcuts = () => {
    const {store} = this.props;
    document.addEventListener('wheel', this.onWheel);

    registerShortcut(
      {
        id: 'Reload',
        title: 'Reload',
        accelerators: ['mod+r', 'f5'],
        index: 1,
      },
      () => {
        store.dispatch(triggerNavigationReload());
      },
      true
    );

    registerShortcut(
      {
        id: 'ZoomIn',
        title: 'Zoom In',
        accelerators: ['mod+=', 'mod++', 'mod+shift+='],
        index: 6,
      },
      () => {
        store.dispatch(onZoomChange(store.getState().browser.zoomLevel + 0.1));
      },
      true
    );

    registerShortcut(
      {id: 'ZoomOut', title: 'Zoom Out', accelerators: ['mod+-'], index: 7},
      () => {
        store.dispatch(onZoomChange(store.getState().browser.zoomLevel - 0.1));
      },
      true
    );

    registerShortcut(
      {id: 'ZoomReset', title: 'Zoom Reset', accelerators: ['mod+0'], index: 8},
      () => {
        store.dispatch(onZoomChange(DEFAULT_ZOOM_LEVEL));
      },
      true
    );

    registerShortcut(
      {id: 'EditUrl', title: 'Edit URL', accelerators: ['mod+l'], index: 9},
      () => {
        document.getElementById('adress').select();
      },
      true
    );

    registerShortcut(
      {
        id: 'ScroolUp',
        title: 'Scroll Up',
        accelerators: ['mod+pageup'],
        index: 10,
      },
      () => {
        store.dispatch(triggerScrollUp());
      },
      true
    );

    registerShortcut(
      {
        id: 'ScroolDown',
        title: 'Scroll Down',
        accelerators: ['mod+pagedown'],
        index: 11,
      },
      () => {
        store.dispatch(triggerScrollDown());
      },
      true
    );

    registerShortcut(
      {
        id: 'Screenshot',
        title: 'Take Screenshot',
        accelerators: ['mod+prtsc', 'mod+shift+s'],
        index: 12,
      },
      () => {
        store.dispatch(screenshotAllDevices());
      },
      true,
      'keyup'
    );

    registerShortcut(
      {
        id: 'RotateDevices',
        title: 'Rotate Devices',
        accelerators: ['mod+tab'],
        index: 13,
      },
      () => {
        store.dispatch(flipOrientationAllDevices());
      },
      true
    );

    registerShortcut(
      {
        id: 'ToggleInspector',
        title: 'Toggle Inspector',
        accelerators: ['mod+i'],
        index: 14,
      },
      () => {
        store.dispatch(toggleInspector());
      },
      true
    );

    registerShortcut(
      {
        id: 'OpenHome',
        title: 'Go to Homepage',
        accelerators: ['alt+home'],
        index: 15,
      },
      () => {
        store.dispatch(goToHomepage());
      },
      true
    );

    registerShortcut(
      {
        id: 'BackAPage',
        title: 'Back a Page',
        accelerators: ['alt+left'],
        index: 16,
      },
      () => {
        store.dispatch(triggerNavigationBack());
      },
      true
    );

    registerShortcut(
      {
        id: 'ForwardAPage',
        title: 'Forward a Page',
        accelerators: ['alt+right'],
        index: 17,
      },
      () => {
        store.dispatch(triggerNavigationForward());
      },
      true
    );

    registerShortcut(
      {
        id: 'DeleteStorage',
        title: 'Delete Storage',
        accelerators: ['mod+del'],
        index: 18,
      },
      () => {
        store.dispatch(deleteStorage());
      },
      true
    );

    registerShortcut(
      {
        id: 'DeleteCookies',
        title: 'Delete Cookies',
        accelerators: ['mod+shift+del'],
        index: 19,
      },
      () => {
        store.dispatch(deleteCookies());
      },
      true
    );

    registerShortcut(
      {
        id: 'AddBookmark',
        title: 'Add Bookmark',
        accelerators: ['mod+d'],
        index: 20,
      },
      () => {
        store.dispatch(toggleBookmarkUrl(store.getState().browser.address));
      },
      true
    );
  };

  onWheel = e => {
    if (e.ctrlKey) {
      const {store} = this.props;
      store.dispatch(
        onZoomChange(
          store.getState().browser.zoomLevel + (e.deltaY < 0 ? 0.1 : -0.1)
        )
      );
    }
  };

  render() {
    const {store} = this.props;
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}
