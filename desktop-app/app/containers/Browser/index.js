// @flow
import React, {Fragment} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Header from '../../components/Header';
import DevicePreviewerContainer from '../DevicePreviewerContainer';
import DrawerContainer from '../DrawerContainer';
import * as BrowserActions from '../../actions/browser';
import Grid from '@material-ui/core/Grid';

type Props = {};

class Browser extends React.Component<Props> {
  props: Props;

  render() {
    return (
      <Fragment>
        <Header />
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            height: '100%',
          }}
        >
          <DrawerContainer />
          <DevicePreviewerContainer />
        </div>
      </Fragment>
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
