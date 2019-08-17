// @flow
import React from 'react';
import Grid from '@material-ui/core/Grid';

import AddressBar from '../../containers/AddressBar';
import ScrollControlsContainer from '../../containers/ScrollControlsContainer';
import ZoomContainer from '../../containers/ZoomContainer';

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
          <ScrollControlsContainer />
        </Grid>
        <Grid item>
          <ZoomContainer />
        </Grid>
      </Grid>
    </div>
  );
};

export default Header;
