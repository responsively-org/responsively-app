import React from 'react';
import Grid from '@material-ui/core/Grid';
import {ToastContainer} from 'react-toastify';
import {makeStyles} from '@material-ui/core/styles';
import AddressBar from '../../containers/AddressBar';
import ScrollControlsContainer from '../../containers/ScrollControlsContainer';
import HttpAuthDialog from '../HttpAuthDialog';
import os from 'os';
import PermissionPopup from '../PermissionPopup';

import NavigationControlsContainer from '../../containers/NavigationControlsContainer';
import BookmarksBar from '../../containers/BookmarksBarContainer';
import Logo from '../icons/Logo';
import ZenButton from '../ZenButton';
import cx from 'classnames';

const Header = props => {
  const classes = useStyles();

  return (
    <div className={cx([classes.container, {zenMode: !props.isHeaderVisible}])}>
      <div className={classes.firstRow}>
        <Logo className={classes.logo} width={40} height={40} />
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
        >
          <Grid item>
            <NavigationControlsContainer />
          </Grid>
          <Grid item style={{flex: 1}}>
            <AddressBar />
            <PermissionPopup />
          </Grid>
          <Grid item>
            <ScrollControlsContainer />
          </Grid>
        </Grid>
      </div>
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
      <ZenButton
        active={!props.isHeaderVisible}
        onClick={() => props.setHeaderVisibility(!props.isHeaderVisible)}
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    position: 'relative',
    background: theme.palette.background.l1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: os.platform() === 'darwin' ? '0 0 5px' : '0 0 0',
    boxShadow: `0 ${theme.palette.mode({
      light: '0px',
      dark: '3px',
    })} 5px rgba(0, 0, 0, 0.35)`,
    zIndex: 5,
    transform: 'translateY(0)',
    transition: 'transform .1s ease-out',
    '& .zenButton': {
      background: theme.palette.background.l1,
      display: 'none',
      position: 'absolute',
      bottom: '0px',
      left: '50%',
      transform: 'translate(-50%, 100%)',
    },
    '&:hover .zenButton': {
      display: 'flex',
    },
    '&.zenMode': {
      transform: 'translateY(-100%)',
    },
    '&.zenMode .zenButton': {
      display: 'flex',
    },
  },
  firstRow: {
    display: 'flex',
  },
  logo: {
    margin: '0 3px',
  },
  darkToast: {
    background: '#696969 !important',
    borderRadius: '5px !important',
    fontSize: '15px',
    fontWeight: 'lighter',
  },
}));

export default Header;
