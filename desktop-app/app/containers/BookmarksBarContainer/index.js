// @flow
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import * as BrowserActions from '../../actions/browser';
import {BookmarksBar} from '../../components/BookmarksBar'

const BookmarksBarContainer = function(props) {
  return (
    <BookmarksBar bookmarks={props.browser.bookmarks} gotoUrl={props.gotoUrl}/>
  );
};

function mapStateToProps(state) {
  return {
    browser: state.browser,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BrowserActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BookmarksBarContainer);
