import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

/**
 * Application toolbar that appears at the top of a window.
 */
const Toolbar = () => {
  const classes = useStyles();
  return <div className={classes.container} />;
};

const useStyles = makeStyles(theme => ({
  container: {
    background: theme.palette.background.l1,
    padding: '11px 0',
    zIndex: '10',
  },
}));

export default Toolbar;
