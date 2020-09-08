// @flow
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import NetworkConfiguration from '../../components/NetworkConfiguration';
import * as NetworkConfigActions from '../../actions/networkConfig';

function mapStateToProps(state) {
  return {
    throttling: state.browser.networkConfiguration.throttling,
    proxy: state.browser.networkConfiguration.proxy,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(NetworkConfigActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NetworkConfiguration);
