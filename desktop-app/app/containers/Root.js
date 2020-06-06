// @flow
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {ConnectedRouter} from 'connected-react-router';
import log from 'electron-log';
import type {Store} from '../reducers/types';
import Routes from '../Routes';
import {createMuiTheme, makeStyles} from '@material-ui/core/styles';
import {ThemeProvider} from '@material-ui/styles';
import {grey} from '@material-ui/core/colors';
import {themeColor} from '../constants/colors';
import ErrorBoundary from '../components/ErrorBoundary';
import {initRendererShortcutManager, registerShortcut, clearShortcuts} from '../shotcut-manager/renderer-shortcut-manager';
import {onZoomChange} from '../actions/browser';
type Props = {
  store: Store,
  history: {},
};

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: themeColor,
    },
    secondary: {
      main: '#424242',
    },
    ternary: {
      main: '#C4C5CE',
    },
    divider: grey[500],
    background: {
      main: '#252526',
    },
  },
});

const getApp = history => {
  if (true || process.env.NODE_ENV !== 'development') {
    return (
      <ErrorBoundary>
        <ConnectedRouter history={history}>
          <Routes />
        </ConnectedRouter>
      </ErrorBoundary>
    );
  }
  return (
    <ConnectedRouter history={history}>
      <Routes />
    </ConnectedRouter>
  );
};

export default class Root extends Component<Props> {
  componentDidMount() {
    initRendererShortcutManager();
    // const {store} = this.props;
    
    // registerShortcut({id: 'ZoomIn', title: 'Zoom In', accelerators: ['CommandOrControl+numadd', 'CommandOrControl+plus']}, () => {
    //   store.dispatch(onZoomChange(store.getState().browser.zoomLevel + 0.1))
    // });

    // registerShortcut({id: 'ZoomOut', title: 'Zoom Out', accelerators: ['CommandOrControl+numsub']}, () => {
    //   store.dispatch(onZoomChange(store.getState().browser.zoomLevel - 0.1))
    // });

    // registerShortcut({id: 'ZoomReset', title: 'Zoom Reset', accelerators: ['CommandOrControl+num0', 'CommandOrControl+0']}, () => {
    //   store.dispatch(onZoomChange(0.6))
    // });
  }

  componentWillUnmount() {
    clearShortcuts();
  }

  render() {
    const {store, history} = this.props;
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>{getApp(history)}</ThemeProvider>
      </Provider>
    );
  }
}
