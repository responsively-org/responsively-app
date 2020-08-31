import React, {useState, useEffect} from 'react';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import cx from 'classnames';
import useCommonStyles from './useCommonStyles';
import GiftIcon from './icons/Gift';

function Headway() {
  const [showGadget, setShowGadget] = useState(false);
  const commonClasses = useCommonStyles();
  useEffect(() => {
    window.HW_config = {
      selector: '#headway', // CSS selector where to inject the badge
      account: 'xdYpn7',
      callbacks: {
        onWidgetReady(widget) {
          setShowGadget(true);
        },
      },
    };
    const headwayScript = document.createElement('script');
    headwayScript.setAttribute('async', '');
    headwayScript.setAttribute('src', 'https://cdn.headwayapp.co/widget.js');
    document.head.appendChild(headwayScript);
    return () => headwayScript.remove();
  }, []);
  const theme = useTheme();
  const classes = useStyles();

  return (
    <div
      id="headway"
      className={cx({
        [commonClasses.hidden]: !showGadget,
        [classes.container]: showGadget,
        [commonClasses.icon]: showGadget,
      })}
    >
      <GiftIcon width="20" height="20" />
    </div>
  );
}

const useStyles = makeStyles(theme => ({
  container: {
    position: 'relative',
    height: '50px',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    '&:hover': {
      background: theme.palette.primary.main,
      opacity: 1,
    },
  },
}));

export default Headway;
