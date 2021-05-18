// @flow
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import * as BrowserActions from '../../actions/browser';
import PageNavigator from '../../components/PageNavigator';

function mapStateToProps(state) {
  return {
    active: !!state.browser.pageNavigator.active,
    selector: state.browser.pageNavigator.selector,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BrowserActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PageNavigator);
