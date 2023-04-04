import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import React from 'react';
import cx from 'classnames';

const LinkHoverDisplay = ({visible, url = ''}) => {
  const componentStyles = useStyles();

  const activeClasses = React.useMemo(() => {
    const classes = {[componentStyles.container]: true};
    classes[componentStyles.show] = visible;
    return cx(classes);
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
    transitionDuration: theme.transitions.duration.enteringScreen,
    transitionTimingFunction: theme.transitions.easing.easeInOut,
    backgroundColor: theme.palette.background.l2,
    border: `1px solid ${theme.palette.background.l0}`,
    boxSizing: 'border-box',
    maxHeight: '2rem',
  },
  show: {
    opacity: 1,
    maxWidth: '95%',
    padding: '3px 4px',
  },
  text: {
    fontSize: '0.7rem',
    margin: 0,
    opacity: 0.7,
    color: theme.palette.mode({light: '#000', dark: '#fff'}),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

export default LinkHoverDisplay;
