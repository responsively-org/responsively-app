// @flow
import React, {Component} from 'react';
import Slider from '@material-ui/core/Slider';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import Grid from '@material-ui/core/Grid';

import styles from './styles.module.css';
import './otherStyles.css';

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
  return (
    <div className={styles.zoomSlider}>
      <Grid container spacing={1}>
        <Grid item>
          <ZoomOutIcon />
        </Grid>
        <Grid item xs>
          <Slider
            value={props.value}
            valueLabelDisplay="auto"
            min={10}
            max={100}
            onChange={(_, value) => props.onChange && props.onChange(value)}
          />
        </Grid>
        <Grid item>
          <ZoomInIcon />
        </Grid>
      </Grid>
    </div>
  );
}
