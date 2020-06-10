// @flow
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import LeftIconsPane from '../../components/LeftIconsPane';
import * as BrowserActions from '../../actions/browser';

function mapStateToProps(state) {
  return {
    drawer: state.browser.drawer,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BrowserActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LeftIconsPane);
