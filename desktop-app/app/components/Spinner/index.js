import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import {makeStyles} from '@material-ui/core/styles';

export default function(props) {
  const classes = makeStyles({
    root: {
      position: 'relative',
    },
    top: {
      color: '#ffffff00', //'#eef3fd',
    },
    bottom: {
      color: '#ffffff80', //'#6798e5',
      animationDuration: '550ms',
      position: 'absolute',
      left: 0,
    },
  })();

  return (
    <div className={classes.root}>
      <CircularProgress
        variant="determinate"
        value={100}
        className={classes.top}
        size={20}
        thickness={4}
        {...props}
      />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        className={classes.bottom}
        size={20}
        thickness={4}
        {...props}
      />
    </div>
  );
}
