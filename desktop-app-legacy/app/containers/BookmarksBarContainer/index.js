import React, {useCallback} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import * as BrowserActions from '../../actions/browser';
import * as BookmarksActions from '../../actions/bookmarks';
import BookmarksBar from '../../components/BookmarksBar';

const BookmarksBarContainer = props => {
  const handleBookmarkClick = useCallback(bookmark => {
    props.onAddressChange(bookmark.url);
  }, []);

  const handleBookmarkDelete = useCallback(bookmark => {
    props.toggleBookmarkUrl(bookmark.url);
  }, []);

  return (
    <BookmarksBar
      bookmarks={props.bookmarks}
      onBookmarkClick={handleBookmarkClick}
      onBookmarkDelete={handleBookmarkDelete}
      onBookmarkEdit={props.editBookmark}
    />
  );
};

function mapStateToProps(state) {
  return {
    bookmarks: state.bookmarks.bookmarks,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      onAddressChange: BrowserActions.onAddressChange,
      ...BookmarksActions,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BookmarksBarContainer);
