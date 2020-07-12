// @flow
import React, {Component, useState, useRef, useEffect} from 'react';
import cx from 'classnames';
import Slider from '@material-ui/core/Slider';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import PlusIcon from '@material-ui/icons/Add';
import MinusIcon from '@material-ui/icons/Minimize';
import Grid from '@material-ui/core/Grid';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ZoomIcon from '../icons/Zoom';

import styles from './styles.module.css';
import commonStyles from '../common.styles.css';
import './otherStyles.css';
import {iconsColor} from '../../constants/colors';
import {Tooltip} from '@material-ui/core';

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

export default function BrowserZoom(props) {
  const [showExpanded, setShowExpanded] = useState(false);
  const zoomRef = useRef();
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
      className={cx(
        commonStyles.icons,
        commonStyles.enabled,
        styles.zoomSlider,
        'MuiGrid-item',
        'MuiGrid-root'
      )}
    >
      <Tooltip title="Zoom In/Out">
        <div onClick={() => setShowExpanded(!showExpanded)}>
          <ZoomIcon width={25} color={iconsColor} />
        </div>
      </Tooltip>
      {/* <Grid container spacing={1}>
        <Grid item>
          <ZoomOutIcon />
        </Grid>
        <Grid item xs>
          <Slider
            value={value}
            valueLabelDisplay="auto"
            min={10}
            max={100}
            onChange={(_, value) => props.onZoomChange(value / 100)}
          />
        </Grid>
        <Grid item>
          <ZoomInIcon />
        </Grid>
  </Grid> */}
      <div
        className={cx(styles.zoomControls, {
          [commonStyles.hidden]: !showExpanded,
        })}
      >
        <ToggleButtonGroup value={[]} onChange={_zoomChange}>
          <ToggleButton value="zoomOut" disabled={value === 20} disableRipple>
            &ndash;
          </ToggleButton>
          <ToggleButton value="value" disabled className={styles.zoomValue}>
            {value}%
          </ToggleButton>
          <ToggleButton value="zoomIn" disabled={value === 200} disableRipple>
            +
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    </div>
  );
}
