// @flow
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import ZoomInput from '../../components/ZoomInput';
import * as BrowserActions from '../../actions/browser';

const ZoomController = function(props) {
  return (
    <ZoomInput
      value={props.browser.zoomLevel * 100}
      onChange={val => props.onZoomChange(val / 100)}
    />
  );
};

function mapStateToProps(state) {
  return {
    browser: state.browser,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BrowserActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ZoomController);
