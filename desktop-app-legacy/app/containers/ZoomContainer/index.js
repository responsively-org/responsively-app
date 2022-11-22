import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import ZoomInput from '../../components/ZoomInput';
import * as BrowserActions from '../../actions/browser';

function mapStateToProps(state) {
  return {
    browser: state.browser,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BrowserActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ZoomInput);
