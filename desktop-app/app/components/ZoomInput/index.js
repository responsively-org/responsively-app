import React, {Component, useState, useRef, useEffect} from 'react';
import cx from 'classnames';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import PlusIcon from '@material-ui/icons/Add';
import MinusIcon from '@material-ui/icons/Minimize';
import Grid from '@material-ui/core/Grid';
import {makeStyles} from '@material-ui/core/styles';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ZoomIcon from '../icons/Zoom';

import styles from './styles.module.css';
import useCommonStyles from '../useCommonStyles';
import './otherStyles.css';
import {Tooltip} from '@material-ui/core';

function BrowserZoom(props) {
  const [showExpanded, setShowExpanded] = useState(false);
  const zoomRef = useRef();
  const classes = useStyles();
  const commonClasses = useCommonStyles();

  const handleClickOutside = event => {
    if (!showExpanded) {
      return;
    }
    if (zoomRef.current && !zoomRef.current.contains(event.target)) {
      setShowExpanded(false);
    }
  };
  useEffect(() => {
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  const _zoomChange = (_, [action]) => {
    switch (action) {
      case 'zoomIn':
        return props.onZoomChange(props.browser.zoomLevel + 0.1);
      case 'zoomOut':
        return props.onZoomChange(props.browser.zoomLevel - 0.1);
      default:
        break;
    }
  };

  const value = Math.round(props.browser.zoomLevel * 100);

  return (
    <div
      ref={zoomRef}
      className={cx(commonClasses.icon, 'MuiGrid-item', 'MuiGrid-root')}
    >
      <Tooltip title="Zoom In/Out">
        <div onClick={() => setShowExpanded(!showExpanded)}>
          <ZoomIcon {...props.iconProps} />
        </div>
      </Tooltip>
      <div
        className={cx(styles.zoomControls, {
          [commonClasses.hidden]: !showExpanded,
        })}
      >
        <ToggleButtonGroup value={[]} onChange={_zoomChange}>
          <ToggleButton value="zoomOut" disabled={value === 20} disableRipple>
            &ndash;
          </ToggleButton>
          <Typography
            className={cx(
              classes.zoomValue,
              commonClasses.flexContainer,
              'MuiToggleButton-root'
            )}
          >
            {value}%
          </Typography>
          <ToggleButton value="zoomIn" disabled={value === 200} disableRipple>
            +
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    </div>
  );
}

const useStyles = makeStyles(theme => ({
  zoomValue: {
    width: '75px',
    color: theme.palette.text.primary,
  },
}));

const marks = [
  {
    value: 25,
    label: '25%',
  },
  {
    value: 50,
    label: '50%',
  },
  {
    value: 100,
    label: '100%',
  },
  {
    value: 200,
    label: '200%',
  },
];

export default BrowserZoom;
