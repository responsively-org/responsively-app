// @flow
import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import DevToolsResizer from '../../components/DevToolsResizer';
import * as BrowserActions from '../../actions/browser';

function mapStateToProps(state) {
  return {
    ...state.browser.devToolsConfig,
    isInspecting: state.browser.isInspecting,
    devices: state.browser.devices,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BrowserActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DevToolsResizer);
