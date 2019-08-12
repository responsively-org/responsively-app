import React from 'react';
import {Switch, Route} from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import Browser from './containers/Browser';
import CounterPage from './containers/CounterPage';
import LeftIconsPane from './components/LeftIconsPane';
import styles from './layout.css';

export default () => (
  <App>
    <div className={styles.appRoot}>
      <div className={styles.iconColumn}>
        <LeftIconsPane />
      </div>
      <div className={styles.contentColumn}>
        <Switch>
          <Route path={routes.COUNTER} component={CounterPage} />
          <Route path={routes.HOME} component={Browser} />
        </Switch>
      </div>
    </div>
  </App>
);
