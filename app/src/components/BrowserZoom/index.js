import React, {Component} from 'react';
import Slider from '@material-ui/core/Slider';

import './styles.css';

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

class BrowserZoom extends Component {

  render() {
    return (
      <div className="zoom-slider">
      Zoom:
      <Slider
        defaultValue={100}
        step={25}
        marks={marks}
        valueLabelDisplay="auto"
        min={25}
        max={200}
        onChange={(_, value) => this.props.onChange && this.props.onChange(value)}
      />
      </div>
    );

  }
}

export default BrowserZoom;