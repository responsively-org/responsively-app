// @flow
import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import {useTheme, makeStyles} from '@material-ui/core/styles';
import Chevron from '../icons/Chevron';
import cx from 'classnames';

/**
 * Button with a Chevron in the middle used for toggling zen mode on/off.
 * @param active Indicates whether zen mode is on or not.
 * @param onClick  Callback function for when the button is clicked.
 */
const ZenButton = ({active = false, onClick}) => {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <div className={cx(['zenButton', classes.container])} onClick={onClick}>
      <Tooltip title="Hide/Show">
        <div className={cx([classes.icon, {invert: active}])}>
          <Chevron width={19} height={8} color={theme.palette.lightIcon.main} />
        </div>
      </Tooltip>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    alignItems: 'center',
    borderRadius: '0 0 8px 8px',
    display: 'flex',
    height: '20px',
    justifyContent: 'center',
    textAlign: 'center',
    width: '80px',
    cursor: 'pointer',
    boxShadow: '0 5px 5px rgba(0, 0, 0, 0.35)',
    zIndex: 90000,
  },
  icon: {
    marginTop: '-5px',
    '&.invert': {
      transform: 'rotateX(180deg) translateY(-5px)',
    },
  },
}));

export default ZenButton;
