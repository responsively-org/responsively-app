/* eslint-disable import/first */
require('dotenv').config();

import React from 'react';
import {remote} from 'electron';
import {render} from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import Root from './containers/Root';
import {configureStore, history} from './store/configureStore';
import './app.global.css';
import * as Sentry from '@sentry/electron';
import console from 'electron-timber';

require('dotenv').config();

if (remote.getGlobal('process').env.NODE_ENV !== 'development') {
  Sentry.init({
    dsn: 'https://f2cdbc6a88aa4a068a738d4e4cfd3e12@sentry.io/1553155',
    environment: remote.getGlobal('process').env.NODE_ENV,
    beforeSend: (event, hint) => {
      if (
        hint &&
        hint.originalException &&
        (hint.originalException.message || '').indexOf(') loading ') > -1
      ) {
        return null;
      }
      event.tags = {appVersion: remote.app.getVersion()};
      return event;
    },
  });
}

if (window.heap) {
  window.heap.addUserProperties({appVersion: remote.app.getVersion()});
}

const store = configureStore();

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    // eslint-disable-next-line global-require
    const NextRoot = require('./containers/Root').default;
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
