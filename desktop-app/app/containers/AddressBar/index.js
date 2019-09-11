// @flow
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import AddressInput from '../../components/Addressinput';
import * as BrowserActions from '../../actions/browser';

const AddressBar = function(props) {
  return (
    <AddressInput
      address={props.browser.address}
      onChange={props.onAddressChange}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddressBar);
