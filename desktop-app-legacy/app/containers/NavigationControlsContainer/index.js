// @flow
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import * as BrowserActions from '../../actions/browser';
import NavigationControls from '../../components/NavigationControls';

function mapStateToProps(state) {
  const {
    navigatorStatus: {backEnabled, forwardEnabled},
    devices,
    address,
    homepage,
  } = state.browser;
  return {backEnabled, forwardEnabled, devices, address, homepage};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BrowserActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(NavigationControls);
