import React from 'react';
import {Switch, Route} from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import Browser from './containers/Browser';
import LeftIconsPaneContainer from './containers/LeftIconsPaneContainer';
import styles from './layout.css';
import StatusBar from './components/StatusBar';
import DevToolResizerContainer from './containers/DevToolResizerContainer';

export default () => (
  <App>
    <div className={styles.appRoot}>
      <div className={styles.iconColumn}>
        <LeftIconsPaneContainer />
      </div>
      <div className={styles.contentColumn}>
        <Switch>
          <Route path={routes.HOME} component={Browser} />
        </Switch>
      </div>
    </div>
    <StatusBar />
    <DevToolResizerContainer />
  </App>
);
