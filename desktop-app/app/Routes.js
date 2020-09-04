import React, {Fragment} from 'react';
import {Switch, Route} from 'react-router';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import {makeStyles} from '@material-ui/core/styles';
import routes from './constants/routes';
import Browser from './containers/Browser';
import LeftIconsPaneContainer from './containers/LeftIconsPaneContainer';
import StatusBarContainer from './containers/StatusBarContainer';
import DevToolResizerContainer from './containers/DevToolResizerContainer';

const Routes = () => {
  const classes = useStyles();
  return (
    <Fragment>
      <Paper elevation={0} className={classes.root}>
        <div className={classes.iconColumn}>
          <LeftIconsPaneContainer />
        </div>
        <div className={classes.contentColumn}>
          <Switch>
            <Route path={routes.HOME} component={Browser} />
          </Switch>
        </div>
      </Paper>
      <StatusBarContainer />
      <DevToolResizerContainer />
    </Fragment>
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
      height: '100%',
      overflow: 'hidden',
      margin: 0,
      display: 'flex',
      boxSizing: 'border-box',
      borderRadius: 0,
      backgroundColor: theme.palette.background.default,
    },
    iconColumn: {
      flexShrink: 0,
      width: '50px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff15',
      boxShadow: '0 3px 5px rgba(0, 0, 0, 0.35)',
      paddingTop: '20px',
    },
    contentColumn: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      overflow: 'hidden',
      flexBasis: 0,
    },
  };
});

export default Routes;
