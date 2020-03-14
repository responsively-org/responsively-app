// @flow
import React from 'react';
import Grid from '@material-ui/core/Grid';

import {ToastContainer} from 'react-toastify';
import AddressBar from '../../containers/AddressBar';
import ScrollControlsContainer from '../../containers/ScrollControlsContainer';
import ZoomContainer from '../../containers/ZoomContainer';
import HttpAuthDialog from '../HttpAuthDialog';

import styles from './style.module.css';
import NavigationControlsContainer from '../../containers/NavigationControlsContainer';

const Header = function() {
    return (
        <div className={styles.header}>
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
                </Grid>
                <Grid item>
                    <ScrollControlsContainer />
                </Grid>
            </Grid>
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
                toastClassName={styles.darkToast}
            />
        </div>
    );
};

export default Header;
