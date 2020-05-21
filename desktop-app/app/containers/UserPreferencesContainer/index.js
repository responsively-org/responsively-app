// @flow
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import UserPreferences from '../../components/UserPreferences';
import * as BrowserActions from '../../actions/browser';

function mapStateToProps(state) {
  return {
    userPreferences: state.browser.userPreferences,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BrowserActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserPreferences);
