import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core';
import React from 'react';
import cx from 'classnames';
import styles from './styles.css';

const LinkHoverDisplay = ({visible, url = ''}) => {
  const componentStyles = useStyles();

  const activeClasses = React.useMemo(() => {
    const classes = {[componentStyles.container]: true};
    classes[componentStyles.show] = visible;
    return cx(classes, styles.container);
  }, [visible]);

  return (
    <div className={activeClasses}>
      <p className={componentStyles.text}>{url}</p>
    </div>
  );
};

LinkHoverDisplay.propTypes = {
  url: PropTypes.string,
  visible: PropTypes.bool,
};

LinkHoverDisplay.defaultProps = {
  url: '',
  visible: false,
};

const useStyles = makeStyles(theme => ({
  container: {
    position: 'absolute',
    bottom: 0,
    maxWidth: 0,
    opacity: 0,
    zIndex: theme.zIndex.tooltip,
    borderTopRightRadius: theme.shape.borderRadius,
    willChange: 'opacity',
    transitionDuration: theme.transitions.duration.enteringScreen,
    transitionTimingFunction: theme.transitions.easing.easeInOut,
  },
  show: {
    opacity: 1,
    maxWidth: '25%',
  },
  text: {
    fontSize: '0.7rem',
    margin: 0,
    opacity: 0.7,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

export default LinkHoverDisplay;
