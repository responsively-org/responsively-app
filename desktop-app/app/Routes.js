import React from 'react';
import {Switch, Route} from 'react-router';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import {makeStyles} from '@material-ui/core/styles';
import routes from './constants/routes';
import Browser from './containers/Browser';
import LeftIconsPaneContainer from './containers/LeftIconsPaneContainer';
import styles from './layout.css';
import StatusBarContainer from './containers/StatusBarContainer';
import DevToolResizerContainer from './containers/DevToolResizerContainer';

const Routes = () => {
  const classes = useStyles();
  return (
    <Paper className={classes.root}>
      <div className={classes.main}>
        <div className={styles.iconColumn}>
          <LeftIconsPaneContainer />
        </div>
        <div className={styles.contentColumn}>
          <Switch>
            <Route path={routes.HOME} component={Browser} />
          </Switch>
        </div>
      </div>
      <StatusBarContainer />
      <DevToolResizerContainer />
    </Paper>
  );
};

const useStyles = makeStyles(theme => {
  const scrollBarBackgroundColor = theme.palette.mode({
    light: theme.palette.grey[300],
    dark: 'rgba(49, 49, 49, 1)',
  });
  return {
    '@global': {
      /* The scrollbar Handle */
      '::-webkit-scrollbar-thumb': {
        WebkitBorderRadius: '10px',
        borderRadius: '10px',
        backgroundColor: scrollBarBackgroundColor,
        WebkitBoxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.2)',
      },
      /* When the scrollbar is inactive */
      '::-webkit-scrollbar-thumb:window-inactive': {
        backgroundColor: scrollBarBackgroundColor,
      },
    },
    root: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: theme.palette.background.default,
    },
    main: {
      display: 'flex',
      height: '100%',
      backgroundColor: 'transparent',
    },
  };
});

export default Routes;
