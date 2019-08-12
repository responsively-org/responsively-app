// @flow
import React from 'react';
import Grid from '@material-ui/core/Grid';

import ZoomContainer from '../../containers/ZoomContainer';
import AddressBar from '../../containers/AddressBar';

import styles from './style.module.css';

const Header = function() {
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
