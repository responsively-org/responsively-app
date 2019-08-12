// @flow
import React, {Component} from 'react';
import ZoomContainer from '../../containers/ZoomContainer';
import AddressBar from '../../containers/AddressBar';
import Grid from '@material-ui/core/Grid';
import cx from 'classnames';

import styles from './style.module.css';

const Header = function(props) {
  return (
    <div className={styles.header}>
      <Grid
        container
        direction="row"
        justify="space-evenly"
        alignItems="center"
      >
        <Grid item>
          <AddressBar />
        </Grid>
        <Grid item>
          <ZoomContainer />
        </Grid>
      </Grid>
    </div>
  );
};

export default Header;
