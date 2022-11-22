// @flow
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import QuickFilterDevices from '../../components/QuickFilterDevices';
import * as BrowserActions from '../../actions/browser';

function mapStateToProps(state) {
  return {
    browser: state.browser,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BrowserActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(QuickFilterDevices);
