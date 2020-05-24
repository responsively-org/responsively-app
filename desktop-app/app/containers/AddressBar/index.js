// @flow
import React, {useEffect} from 'react';
import {ipcRenderer} from 'electron';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import AddressInput from '../../components/Addressinput';
import * as BrowserActions from '../../actions/browser';

const AddressBar = function(props) {
  useEffect(() => {
    ipcRenderer.on('address-change', (_, url) => {
      props.onAddressChange(url);
    });
  }, []);
  return (
    <AddressInput
      address={props.browser.address}
      onChange={props.onAddressChange}
      homepage={props.browser.homepage}
      setHomepage={props.setCurrentAddressAsHomepage}
      deleteCookies={props.deleteCookies}
    />
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

export default connect(mapStateToProps, mapDispatchToProps)(AddressBar);
