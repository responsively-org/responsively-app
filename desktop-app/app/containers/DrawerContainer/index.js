// @flow
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import Drawer from '../../components/Drawer';
import * as BrowserActions from '../../actions/browser';

function mapStateToProps(state) {
  return {
    drawer: state.browser.drawer,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BrowserActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
