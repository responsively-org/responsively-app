import React, {useEffect} from 'react';
import {ipcRenderer} from 'electron';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import AddressInput from '../../components/AddressInput';
import * as BrowserActions from '../../actions/browser';
import {toggleBookmarkUrl} from '../../actions/bookmarks';

const AddressBar = props => {
  const handler = (_, url) => {
    props.onAddressChange(url);
  };
  useEffect(() => {
    ipcRenderer.on('address-change', handler);
    return () => ipcRenderer.removeListener('address-change', handler);
  }, []);
  return (
    <AddressInput
      address={props.browser.address}
      onChange={props.onAddressChange}
      homepage={props.browser.homepage}
      setHomepage={props.setCurrentAddressAsHomepage}
      isBookmarked={props.isBookmarked}
      toggleBookmark={url =>
        props.toggleBookmarkUrl(url, props.browser.currentPageMeta)
      }
      deleteCookies={props.deleteCookies}
      deleteStorage={props.deleteStorage}
    />
  );
};

function mapStateToProps(state) {
  return {
    browser: state.browser,
    isBookmarked: state.bookmarks.bookmarks.some(
      b => b.url === state.browser.address
    ),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({...BrowserActions, toggleBookmarkUrl}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AddressBar);
