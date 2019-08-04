import React from 'react';
import { connect } from 'react-redux';

import ZoomInput from '../../components/ZoomInput';
import {actions} from '../../state/preview/actions';


const ZoomController = props => {
  return <ZoomInput onChange={props.setZoom} />
};

const mapStateToProps = state => ({
  zoomLevel: state.preview.zoom,
});

const mapDispatchToProps = ({
  setZoom: actions.setZoom
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ZoomController);

