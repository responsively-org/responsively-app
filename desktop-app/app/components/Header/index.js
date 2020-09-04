import React from 'react';
import Grid from '@material-ui/core/Grid';
import {ToastContainer} from 'react-toastify';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import AddressBar from '../../containers/AddressBar';
import ScrollControlsContainer from '../../containers/ScrollControlsContainer';
import HttpAuthDialog from '../HttpAuthDialog';
import PermissionPopup from '../PermissionPopup';

import NavigationControlsContainer from '../../containers/NavigationControlsContainer';
import BookmarksBar from '../../containers/BookmarksBarContainer';
import AppNotification from '../AppNotification/AppNotification';

const Header = () => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <div className={classes.container}>
      <Grid container direction="row" justify="flex-start" alignItems="center">
        <Grid item>
          <NavigationControlsContainer />
        </Grid>
        <Grid item style={{flex: 1}}>
          <AddressBar />
        </Grid>
        <Grid item>
          <ScrollControlsContainer />
        </Grid>
      </Grid>
      <BookmarksBar />
      <HttpAuthDialog />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss={false}
        rtl={false}
        draggable
        pauseOnHover
        toastClassName={classes.darkToast}
      />
      <AppNotification />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
    padding: '20px 0 5px',
    background: theme.palette.header.main,
    boxShadow: `0 ${theme.palette.mode({
      light: '0px',
      dark: '3px',
    })} 5px rgba(0, 0, 0, 0.35)`,
    zIndex: 5,
  },
  darkToast: {
    background: '#696969 !important',
    borderRadius: '5px !important',
    fontSize: '15px',
    fontWeight: 'lighter',
  },
}));

export default Header;
