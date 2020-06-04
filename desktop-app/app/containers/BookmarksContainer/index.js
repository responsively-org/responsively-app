// @flow
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import BookmarksDrawer from '../../components/BookmarksDrawer';
import * as BrowserActions from '../../actions/browser';

function mapStateToProps(state) {
  return {
    bookmarks: state.browser.bookmarks,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BrowserActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BookmarksDrawer);
