// @flow
import React from 'react';
import MaterialDrawer from '@material-ui/core/Drawer';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DeviceDrawerContainer from '../../containers/DeviceDrawerContainer';
import cx from 'classnames';
import {Icon} from 'flwww';

import styles from './styles.css';
import commonStyles from '../common.styles.css';
import {DEVICE_MANAGER} from '../../constants/DrawerContents';
import {iconsColor} from '../../constants/colors';
import DoubleLeftArrowIcon from '../icons/DoubleLeftArrow';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        justifyContent: 'flex-end',
        margin: '0 0 10px',
        '&:hover': {},
    },
    iconHover: {
        color: iconsColor,
        opacity: 0.8,
        borderRadius: '50%',
        '&:hover': {
            opacity: 1,
            color: '#8c8c8c42',
        },
    },
}));

export function Drawer(props) {
    const classes = useStyles();
    return (
        <div className={cx(styles.drawer, {[styles.open]: props.drawer.open})}>
            <div
                className={classes.root}
                onClick={() => props.changeDrawerOpenState(false)}
            >
                <div
                    className={cx(
                        commonStyles.flexContainer,
                        commonStyles.icons,
                        commonStyles.enabled
                    )}
                    onClick={() => props.changeDrawerOpenState(false)}
                >
                    <DoubleLeftArrowIcon color="white" height={30} />
                </div>
                {/*<Icon type="chevronsLeft" title="Close Drawer" color="white" className={classes.iconHover} />*/}
                {/*<ChevronLeftIcon className={classes.iconHover} />*/}
            </div>
            <div className={styles.contentContainer}>
                {getDrawerContent(props.drawer.content)}
            </div>
        </div>
    );
}

const deviceDrawerComponent = <DeviceDrawerContainer />;

function getDrawerContent(type) {
    switch (type) {
        case DEVICE_MANAGER:
            return deviceDrawerComponent;
    }
}

export default Drawer;
