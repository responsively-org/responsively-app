import React, {Component, useEffect} from 'react';
import {Provider} from 'react-redux';
import log from 'electron-log';
import {makeStyles} from '@material-ui/core/styles';
import {ThemeProvider} from '@material-ui/styles';
import {remote} from 'electron';
import AppContent from '../AppContent';
import ErrorBoundary from '../components/ErrorBoundary';
import {ShortcutManager} from '../managers/shortcut-manager';
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
} from '../actions/browser';
import {toggleBookmarkUrl} from '../actions/bookmarks';
import pubsub from 'pubsub.js';
import {PROXY_AUTH_ERROR} from '../constants/pubsubEvents';
import useCreateTheme from '../components/useCreateTheme';
import {DEFAULT_ZOOM_LEVEL} from '../constants';
import {AppTitleBarManager} from '../managers/app-title-bar-manager';

function App() {
  const theme = useCreateTheme();

  useEffect(() => {
    AppTitleBarManager.updateBackground(theme.palette.type);
  }, [theme]);

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
    AppTitleBarManager.initTitleBar(this.props.store.getState().browser.theme);
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
    AppTitleBarManager.dispose();
    ShortcutManager.clearAllShortcuts();
    document.removeEventListener('wheel', this.onWheel);
    remote.session.defaultSession.webRequest.onErrorOccurred(null);
  }

  registerAllShortcuts = () => {
    const {store} = this.props;
    document.addEventListener('wheel', this.onWheel);

    ShortcutManager.registerShortcut(
      {
        id: 'ZoomIn',
        title: 'Zoom In',
        accelerators: ['mod+=', 'mod++', 'mod+shift+='],
      },
      () => {
        store.dispatch(onZoomChange(store.getState().browser.zoomLevel + 0.1));
      },
      true
    );

    ShortcutManager.registerShortcut(
      {id: 'ZoomOut', title: 'Zoom Out', accelerators: ['mod+-']},
      () => {
        store.dispatch(onZoomChange(store.getState().browser.zoomLevel - 0.1));
      },
      true
    );

    ShortcutManager.registerShortcut(
      {id: 'ZoomReset', title: 'Zoom Reset', accelerators: ['mod+0']},
      () => {
        store.dispatch(onZoomChange(DEFAULT_ZOOM_LEVEL));
      },
      true
    );

    ShortcutManager.registerShortcut(
      {id: 'EditUrl', title: 'Edit URL', accelerators: ['mod+l']},
      () => {
        document.getElementById('adress').select();
      },
      true
    );

    ShortcutManager.registerShortcut(
      {id: 'ScroolUp', title: 'Scroll Up', accelerators: ['mod+pageup']},
      () => {
        store.dispatch(triggerScrollUp());
      },
      true
    );

    ShortcutManager.registerShortcut(
      {id: 'ScroolDown', title: 'Scroll Down', accelerators: ['mod+pagedown']},
      () => {
        store.dispatch(triggerScrollDown());
      },
      true
    );

    ShortcutManager.registerShortcut(
      {id: 'Screenshot', title: 'Take Screenshot', accelerators: ['mod+prtsc']},
      () => {
        store.dispatch(screenshotAllDevices());
      },
      true,
      'keyup'
    );

    ShortcutManager.registerShortcut(
      {id: 'TiltDevices', title: 'Tilt Devices', accelerators: ['mod+tab']},
      () => {
        store.dispatch(flipOrientationAllDevices());
      },
      true
    );

    ShortcutManager.registerShortcut(
      {
        id: 'ToggleInspector',
        title: 'Toggle Inspector',
        accelerators: ['mod+i'],
      },
      () => {
        store.dispatch(toggleInspector());
      },
      true
    );

    ShortcutManager.registerShortcut(
      {id: 'OpenHome', title: 'Go to Homepage', accelerators: ['alt+home']},
      () => {
        store.dispatch(goToHomepage());
      },
      true
    );

    ShortcutManager.registerShortcut(
      {id: 'BackAPage', title: 'Back a Page', accelerators: ['alt+left']},
      () => {
        store.dispatch(triggerNavigationBack());
      },
      true
    );

    ShortcutManager.registerShortcut(
      {
        id: 'ForwardAPage',
        title: 'Forward a Page',
        accelerators: ['alt+right'],
      },
      () => {
        store.dispatch(triggerNavigationForward());
      },
      true
    );

    ShortcutManager.registerShortcut(
      {id: 'DeleteStorage', title: 'Delete Storage', accelerators: ['mod+del']},
      () => {
        store.dispatch(deleteStorage());
      },
      true
    );

    ShortcutManager.registerShortcut(
      {
        id: 'DeleteCookies',
        title: 'Delete Cookies',
        accelerators: ['mod+shift+del'],
      },
      () => {
        store.dispatch(deleteCookies());
      },
      true
    );

    ShortcutManager.registerShortcut(
      {
        id: 'AddBookmark',
        title: 'Add Bookmark',
        accelerators: ['mod+d'],
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
