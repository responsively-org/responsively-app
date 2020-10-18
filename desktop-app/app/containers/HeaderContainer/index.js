// @flow

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import Header from '../../components/Header';
import * as BrowserActions from '../../actions/browser';

function mapStateToProps(state) {
  return {
    isHeaderVisible: state.browser.isHeaderVisible,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BrowserActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
