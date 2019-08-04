import React, { Component } from 'react';
import ZoomController from '../../containers/ZoomController';
import Grid from '@material-ui/core/Grid';
import cx from 'classnames';

import styles from './style.module.css';

class Header extends Component {

  render() {
    return (
      <Grid
        container
        direction="row"
        justify="space-evenly"
        alignItems="center"
      >
        <Grid item><h1>Whater</h1></Grid>
        <Grid item><ZoomController /></Grid>
      </Grid>
    );
  }
}

export default Header;