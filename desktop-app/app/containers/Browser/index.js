// @flow
import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import AddressBar from '../../components/AddressBar';
import * as BrowserActions from '../../actions/browser';

type Props = {};

class Browser extends React.Component<Props> {
  props: Props;

  render() {
    console.log('Props', this.props);
    return (
      <div>
        <AddressBar onChange={this.props.onAddressChange} />
      </div>
    );
  }
}

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
)(Browser);
