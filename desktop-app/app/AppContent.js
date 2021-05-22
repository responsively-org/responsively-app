import React, {Fragment} from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import {makeStyles} from '@material-ui/core/styles';
import routes from './constants/routes';
import Browser from './containers/Browser';
import LeftIconsPaneContainer from './containers/LeftIconsPaneContainer';
import StatusBarContainer from './containers/StatusBarContainer';
import DevToolResizerContainer from './containers/DevToolResizerContainer';

const AppContent = () => {
  const classes = useStyles();
  return (
    <Fragment>
      <Paper elevation={0} className={classes.root}>
        <div className={classes.contentColumn}>
          <Browser />
        </div>
      </Paper>
      <StatusBarContainer />
      <DevToolResizerContainer />
    </Fragment>
  );
};

const useStyles = makeStyles(theme => ({
  '@global': {
    /* The scrollbar Handle */
    '::-webkit-scrollbar-thumb': {
      WebkitBorderRadius: '10px',
      borderRadius: '10px',
      backgroundColor: theme.palette.scrollbar.main,
      WebkitBoxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.2)',
    },
    /* When the scrollbar is inactive */
    '::-webkit-scrollbar-thumb:window-inactive': {
      backgroundColor: theme.palette.scrollbar.main,
    },
  },
  root: {
    height: '100%',
    overflow: 'hidden',
    margin: 0,
    display: 'flex',
    boxSizing: 'border-box',
    borderRadius: 0,
    backgroundColor: theme.palette.background.l0,
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
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflow: 'hidden',
    flexBasis: 0,
  },
}));

export default AppContent;
