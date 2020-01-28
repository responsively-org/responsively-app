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
import LicenseManager from '../components/LicenseManager';
import {themeColor} from '../constants/colors';
import ErrorBoundary from '../components/ErrorBoundary';

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
        <LicenseManager>
          <ConnectedRouter history={history}>
            <Routes />
          </ConnectedRouter>
        </LicenseManager>
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
  render() {
    const {store, history} = this.props;
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>{getApp(history)}</ThemeProvider>
      </Provider>
    );
  }
}
